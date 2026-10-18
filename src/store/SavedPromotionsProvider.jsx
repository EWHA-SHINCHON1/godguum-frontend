import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ensureLoggedIn, startKakaoLogin } from "../api/auth";
import {
  removePromotionBookmark,
  savePromotionBookmark,
} from "../api/promotions";
import { SavedPromotionsContext } from "./savedPromotions";

/**
 * 북마크(저장) 상태를 앱 전체에서 함께 쓰기 위한 Provider (명세서 ⑥)
 * 화면을 그리지는 않고, 북마크 데이터와 동작만 관리해서 필요한 화면에 나눠줌
 *
 * ── 이 Provider 는 ...
 * "이번 방문 중에 사용자가 직접 바꾼 값"만 기억함 (overrides)
 *   예) 홈에서 12번을 저장 → overrides = { 12: true }
 *       → 목록·상세·저장 화면에서 12번을 그릴 때 서버 값보다 이 값을 우선
 *       → 화면을 오가도 아이콘이 똑같이 보임
 * 페이지를 새로고침하면 overrides 는 비워지고, 다시 서버 is_saved 를 그대로 씀
 *
 * ── 화면에서 쓰는 법 ──
 *   const { isSaved, toggleSave } = useSavedPromotions();
 *   isSaved(promotion.id, promotion.is_saved)  → 아이콘 채울지 여부
 *   toggleSave(promotion.id, nextSaved)        → 북마크 버튼 눌렀을 때
 *   resetSaved()                               → 로그아웃할 때 (이전 사용자 기록 지우기)
 */

// 예전 버전이 localStorage 에 저장하던 키. 이제 안 쓰므로 남아 있으면 지움
const LEGACY_STORAGE_KEY = "godguum:saved-promotion-ids";

export default function SavedPromotionsProvider({ children }) {
  // { [프로모션 id]: true/false } — 이번 방문 중 사용자가 바꾼 값
  const [overrides, setOverrides] = useState({});

  // 지금 서버 요청 중인 프로모션 id 모음
  // 같은 북마크를 연타하면 PUT·DELETE 순서가 꼬일 수 있어서 요청 중에는 무시
  // (화면을 다시 그릴 필요가 없는 값이라 useState 대신 useRef)
  const pendingIdsRef = useRef(new Set());

  useEffect(() => {
    try {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // 저장소 접근이 막혀 있어도 북마크 동작에는 영향 없음
    }
  }, []);

  // 특정 프로모션 id 의 값만 바꾸는 도우미
  // { ...prev, [id]: value } → 기존 객체를 복사하고 id 칸만 새 값으로 (React 가 변화를 알아챔)
  const setOverride = useCallback((id, value) => {
    setOverrides((prev) => ({ ...prev, [id]: value }));
  }, []);

  /**
   * 아이콘을 채울지 말지
   * @param id           프로모션 id
   * @param serverSaved  서버 응답의 is_saved (없으면 false)
   *
   * 사용자가 이번 방문 중에 바꾼 적 있으면 그 값, 아니면 서버 값
   * `id in overrides` : overrides 객체에 id 라는 키가 있는지 확인
   */
  const isSaved = useCallback(
    (id, serverSaved = false) =>
      id in overrides ? overrides[id] : serverSaved,
    [overrides],
  );

  /**
   * 북마크 버튼을 눌렀을 때 실행 (모든 화면 공통)
   * @param id         프로모션 id
   * @param nextSaved  바뀔 값. Bookmark 컴포넌트가 onToggle(!saved) 로 넘겨줌
   *
   * 돌려주는 값 (await 해서 결과가 필요한 화면만 사용)
   *   { ok: true, saved }   성공
   *   { ok: false, error }  실패 (아이콘은 이미 원래대로 되돌려 둠)
   *   null                  아무것도 안 함 (요청 중 연타, 로그인 이동 등)
   */
  const toggleSave = useCallback(
    async (id, nextSaved) => {
      if (pendingIdsRef.current.has(id)) return null;

      // 1) 로그인 확인 → 안 돼 있으면 카카오 로그인으로 (끝나면 지금 페이지로 복귀 시도)
      //    백엔드는 next 로 "/" 와 "/promotions/숫자" 만 허용 → 홈·목록에서 누르면 로그인 후 "/" 로 돌아감
      const currentPath = window.location.pathname;
      try {
        const isLoggedIn = await ensureLoggedIn(currentPath);
        if (!isLoggedIn) return null;
      } catch (error) {
        // /auth/me/ 자체 실패 (네트워크 등) → 아무것도 바꾸지 않음
        console.warn("[bookmark] 로그인 상태 확인 실패", error);
        return { ok: false, error };
      }

      // Bookmark 는 항상 !saved 를 넘기므로, 바뀌기 전 값 = !nextSaved
      const prevSaved = !nextSaved;

      // 2) 낙관적 업데이트: 서버 응답 전에 아이콘부터 바꿈
      setOverride(id, nextSaved);
      pendingIdsRef.current.add(id);

      try {
        // 3) 서버 요청: 저장이면 PUT, 취소면 DELETE
        const result = nextSaved
          ? await savePromotionBookmark(id)
          : await removePromotionBookmark(id);

        // 4) 서버가 알려준 최종 값으로 확정
        setOverride(id, result.saved);
        return { ok: true, saved: result.saved };
      } catch (error) {
        // 5) 실패 → 원래 값으로 되돌림
        setOverride(id, prevSaved);

        if (error.status === 401) {
          // 확인 직후 세션이 만료된 경우 → 다시 로그인
          startKakaoLogin(currentPath);
        } else {
          // 403 CSRF_FAILED, 404(비공개된 프로모션), 네트워크 오류 등
          console.warn(
            "[bookmark] 북마크 변경 실패",
            error.status,
            error.code,
            error,
          );
        }
        return { ok: false, error };
      } finally {
        // 성공·실패 상관없이 요청 끝 → 다시 누를 수 있게
        pendingIdsRef.current.delete(id);
      }
    },
    [setOverride],
  );

  /**
   * 로그아웃할 때 호출 (명세서 ⑥-10 "로그아웃 → 개인 데이터 초기화")
   * overrides 에는 "이전 사용자가 이번 방문 중 누른 북마크"가 남아 있음
   * → 안 비우면 다른 계정으로 로그인했을 때 남의 북마크 아이콘이 채워져 보일 수 있음
   */
  const resetSaved = useCallback(() => {
    setOverrides({});
    pendingIdsRef.current.clear();
  }, []);

  // useMemo: overrides 가 바뀔 때만 새 객체를 만들어 넘김 (불필요한 리렌더링 방지)
  const value = useMemo(
    () => ({ isSaved, toggleSave, resetSaved }),
    [isSaved, toggleSave, resetSaved],
  );

  return (
    <SavedPromotionsContext.Provider value={value}>
      {children}
    </SavedPromotionsContext.Provider>
  );
}
