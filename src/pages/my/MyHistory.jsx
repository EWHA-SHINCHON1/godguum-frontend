import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GNB, Header } from "../../components/common";
import UsedCouponCard from "../../components/coupon/UsedCouponCard";
import { getMyCoupons } from "../../api/coupon";

/**
 * 4-2 이용내역 — 사용 완료한 쿠폰 목록 (명세서 ⑥-9)
 * GET /me/coupons/?status=used&page=N
 *
 * 정렬 주의: 서버 정렬은 "발급 최신순"
 *   → 화면에서 "최근 사용순"이라고 안내하지 않음
 *   → 프론트에서 used_at 으로 다시 정렬하지도 않음 (20개씩 끊어서 오기 때문에
 *      한 페이지만 정렬하면 2페이지와 순서가 어긋남)
 *
 * 화면 상태 4가지를 구분 (명세서 ⑥-11 "조회 실패를 빈 목록으로 처리하지 않음")
 *   loading → 불러오는 중
 *   error   → 실패 안내 + 다시 시도 버튼
 *   success + 0개 → "아직 이용한 내역이 없어요"
 *   success + n개 → 카드 목록
 * 비로그인(401)이면 로그인 화면으로 보냄
 */
export default function MyHistory() {
  const navigate = useNavigate();

  const [histories, setHistories] = useState([]); // 지금까지 불러온 쿠폰들
  const [status, setStatus] = useState("loading"); // "loading" | "error" | "success"
  const [nextPage, setNextPage] = useState(null); // 다음에 불러올 페이지 번호 (없으면 null)
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [retryKey, setRetryKey] = useState(0); // 바뀌면 처음부터 다시 조회

  // 401 이면 로그인 화면으로. 그 외 에러는 false 를 돌려서 호출한 쪽이 처리
  const redirectIfLoggedOut = useCallback(
    (error) => {
      if (error.status === 401) {
        navigate("/login", { replace: true });
        return true;
      }
      return false;
    },
    [navigate],
  );

  // 1페이지 조회 (처음 들어왔을 때 + 다시 시도 눌렀을 때)
  useEffect(() => {
    // 화면을 벗어난 뒤에 응답이 와도 state 를 안 바꾸도록 (기존 페이지들과 같은 패턴)
    let isCurrent = true;

    setStatus("loading");

    getMyCoupons({ status: "used", page: 1 })
      .then((data) => {
        if (!isCurrent) return;
        setHistories(data.results ?? []);
        setNextPage(data.next ? 2 : null);
        setStatus("success");
      })
      .catch((error) => {
        if (!isCurrent) return;
        if (redirectIfLoggedOut(error)) return;
        console.warn(
          "[history] 이용내역 조회 실패",
          error.status,
          error.code,
          error,
        );
        setStatus("error");
      });

    return () => {
      isCurrent = false;
    };
  }, [retryKey, redirectIfLoggedOut]);

  // "더보기" — 다음 페이지를 불러와서 뒤에 이어 붙임
  const handleLoadMore = async () => {
    if (!nextPage || isLoadingMore) return; // 연타 방지

    setIsLoadingMore(true);
    try {
      const data = await getMyCoupons({ status: "used", page: nextPage });

      setHistories((prev) => {
        // 그 사이에 목록이 바뀌어서 같은 쿠폰이 또 올 수 있음 → id 로 중복 제거
        const seen = new Set(prev.map((coupon) => coupon.id));
        return [
          ...prev,
          ...(data.results ?? []).filter((c) => !seen.has(c.id)),
        ];
      });
      setNextPage(data.next ? nextPage + 1 : null);
    } catch (error) {
      if (redirectIfLoggedOut(error)) return;
      console.warn(
        "[history] 다음 페이지 조회 실패",
        error.status,
        error.code,
        error,
      );
      alert("내역을 더 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  let content;

  if (status === "loading") {
    content = (
      <p className="flex flex-1 items-center justify-center text-body2 font-medium text-fg-muted">
        이용내역을 불러오는 중이에요
      </p>
    );
  } else if (status === "error") {
    content = (
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <p className="text-body2 font-medium text-fg-muted">
          이용내역을 불러오지 못했어요
        </p>
        <button
          type="button"
          onClick={() => setRetryKey((key) => key + 1)}
          className="rounded-full bg-brand-weak px-4 py-2 text-body3 font-semibold text-brand-strong"
        >
          다시 시도
        </button>
      </div>
    );
  } else if (histories.length === 0) {
    content = (
      <p className="flex flex-1 items-center justify-center text-body2 font-medium text-fg-muted">
        아직 이용한 내역이 없어요
      </p>
    );
  } else {
    content = (
      <>
        <ul className="flex flex-col gap-3 px-5 pt-2" aria-label="이용내역">
          {histories.map((coupon) => (
            <li key={coupon.id}>
              <UsedCouponCard
                coupon={coupon}
                // 카드를 누르면 해당 프로모션 상세로 (기존 동작 유지)
                onClick={() => navigate(`/promotions/${coupon.promotion.id}`)}
              />
            </li>
          ))}
        </ul>

        {nextPage && (
          <div className="flex justify-center px-5 pt-4">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="rounded-full bg-brand-weak px-4 py-2 text-body3 font-semibold text-brand-strong disabled:opacity-50"
            >
              {isLoadingMore ? "불러오는 중..." : "더보기"}
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-[402px] flex-col bg-brand-surface pb-28">
      <Header
        title="이용내역"
        onBack={() => navigate(-1)}
        className="bg-transparent"
      />

      {content}

      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-20 mx-auto w-[min(362px,calc(100%-40px))]">
        <GNB
          active="my"
          className="pointer-events-auto shadow-[0_4px_12px_rgba(136,83,0,0.08)]"
        />
      </div>
    </main>
  );
}
