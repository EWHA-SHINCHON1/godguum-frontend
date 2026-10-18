import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import savedEmptyImage from "../../assets/icons/bookmark/bookmark-empty.svg";
import { Button, GNB, TopBar } from "../../components/common";
import PromotionListCard from "../../components/promotion/PromotionListCard";
import { getSavedPromotions } from "../../api/promotions";
import { startKakaoLogin } from "../../api/auth";
import { useSavedPromotions } from "../../store/savedPromotions";
import { toListCard } from "../../utils/promotionCard";

// 가운데 정렬 안내 문구 + 버튼 (로딩·로그인 필요·오류에서 같이 씀)
function StateMessage({ message, action, isError }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 py-20">
      <p
        className="text-center text-body2 font-medium text-fg-muted"
        role={isError ? "alert" : "status"}
      >
        {message}
      </p>
      {action}
    </div>
  );
}

/** 저장한 프로모션 (명세서 ⑥) */
export default function SavedPromotionsPage() {
  const navigate = useNavigate();
  // isSaved: 아이콘 상태 / toggleSave: 북마크 버튼 동작 (store/SavedPromotionsProvider.jsx)
  const { isSaved, toggleSave } = useSavedPromotions();

  const [state, setState] = useState({
    results: [],
    loading: true,
    error: null,
  });
  // "다시 시도" 버튼을 누르면 값이 바뀌면서 목록을 다시 조회
  const [reloadKey, setReloadKey] = useState(0);

  // GET /me/saved-promotions/ → 서버에 저장된 내 북마크 목록
  useEffect(() => {
    let isCurrent = true;
    setState({ results: [], loading: true, error: null });

    getSavedPromotions()
      .then((data) => {
        if (isCurrent) {
          setState({ results: data.results, loading: false, error: null });
        }
      })
      .catch((error) => {
        if (isCurrent) setState({ results: [], loading: false, error });
      });

    return () => {
      isCurrent = false;
    };
  }, [reloadKey]);

  // 카드 모양으로 변환 + 이번 방문 중 저장 취소한 건 목록에서 빼기
  // 저장 목록이라 서버 값은 항상 true → isSaved(id, true) 가 false 면 방금 취소한 것
  // (취소 요청이 실패하면 Provider 가 다시 true 로 되돌려서 카드가 다시 나타남)
  const savedPromotions = useMemo(
    () =>
      state.results
        .map((promotion) => toListCard(promotion, isSaved))
        .filter((promotion) => promotion.saved),
    [state.results, isSaved],
  );

  // 상태별 화면: 로딩 → 로그인 필요(401) → 기타 오류 → 목록 → 빈 목록
  let content;

  if (state.loading) {
    content = <StateMessage message="불러오는 중이에요" />;
  } else if (state.error?.status === 401) {
    // 비로그인으로 들어온 경우
    // 백엔드는 로그인 후 돌아올 곳(next)으로 "/" 와 "/promotions/숫자" 만 허용 → "/" 로 복귀
    content = (
      <StateMessage
        message="로그인하면 저장한 프로모션을 볼 수 있어요"
        action={
          <Button
            variant="secondary"
            className="w-[180px]"
            onClick={() => startKakaoLogin("/")}
          >
            로그인하기
          </Button>
        }
      />
    );
  } else if (state.error) {
    content = (
      <StateMessage
        isError
        message="저장한 프로모션을 불러오지 못했어요"
        action={
          <Button
            variant="secondary"
            className="w-[180px]"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            다시 시도
          </Button>
        }
      />
    );
  } else if (savedPromotions.length > 0) {
    // TODO: 한 번에 20개까지만 옴 (서버 page_size=20). 더 많아지면 next 로 다음 페이지 불러오기 필요
    content = (
      <ul
        className="flex flex-col gap-3 px-5 pt-3"
        aria-label="저장한 프로모션"
      >
        {savedPromotions.map((promotion) => (
          <li key={promotion.id}>
            <PromotionListCard
              promotion={promotion}
              onClick={() => navigate(`/promotions/${promotion.id}`)}
              onToggleSave={(saved) => toggleSave(promotion.id, saved)}
            />
          </li>
        ))}
      </ul>
    );
  } else {
    content = (
      <section className="flex flex-1 flex-col items-center justify-center px-5 pt-[26px]">
        <img src={savedEmptyImage} alt="" width={239} height={146} />
        <div className="flex w-full flex-col items-center gap-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-head1 font-semibold tracking-[-0.02px] text-fg">
              아직 저장한 프로모션이 없어요
            </h1>
            <p className="text-body2 font-medium tracking-[-0.014px] text-fg-muted">
              마음에 드는 프로모션을 저장하고
              <br />
              나중에 다시 확인해보세요!
            </p>
          </div>
          <Button
            variant="secondary"
            className="w-[180px]"
            onClick={() => navigate("/promotions")}
          >
            프로모션 둘러보기
          </Button>
        </div>
      </section>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-[402px] flex-col bg-brand-surface pb-28">
      <TopBar onLogoClick={() => navigate("/home")} />

      {content}

      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-20 mx-auto w-[min(362px,calc(100%-40px))]">
        <GNB
          active="home"
          className="pointer-events-auto shadow-[0_4px_12px_rgba(136,83,0,0.08)]"
        />
      </div>
    </main>
  );
}
