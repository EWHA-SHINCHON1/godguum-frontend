import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GNB, SearchBar, TopBar } from "../../components/common";
import MainPromotionBanner from "../../components/home/MainPromotionBanner";
import PromotionSection from "../../components/home/PromotionSection";
import { getPromotions } from "../../api/promotions";
import { useSavedPromotions } from "../../store/savedPromotions";
import todayPromotionIcon from "../../assets/icons/promotion-today.svg";
import trendingFireIcon from "../../assets/icons/trending-fire.svg";
import { getDday } from "../../utils/date";

const TODAY_FILTERS = ["전체", "진행중", "곧 시작", "오늘 마감"];
const TODAY_FILTER_PARAMS = {
  전체: {},
  진행중: { status: "active" },
  "곧 시작": { status: "upcoming" },
  "오늘 마감": { status: "active", closing_today: true },
};

const seoulDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function toCardPromotion(promotion, isSaved) {
  return {
    id: promotion.id,
    storeName: promotion.store?.name || "",
    title: promotion.title || promotion.benefit || "",
    benefit: promotion.benefit || "",
    image: promotion.image_url || undefined,
    dDay: getDday(promotion.ends_at),
    // 서버 is_saved 를 기본으로, 이번 방문 중 바꾼 값이 있으면 그 값
    saved: isSaved(promotion.id, promotion.is_saved),
  };
}

function PromotionStateMessage({ loading, error, isEmpty }) {
  if (!loading && !error && !isEmpty) {
    return null;
  }

  const message = loading
    ? "프로모션을 불러오는 중입니다."
    : error
      ? "프로모션을 불러오지 못했습니다."
      : "표시할 프로모션이 없어요.";

  return <p className="py-2 text-body3 font-medium text-fg-muted">{message}</p>;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("전체");
  const [todayState, setTodayState] = useState({
    results: [],
    loading: true,
    error: false,
  });
  const [trendingState, setTrendingState] = useState({
    results: [],
    loading: true,
    error: false,
  });
  // isSaved: 아이콘 상태 / toggleSave: 북마크 버튼 동작 (store/SavedPromotionsProvider.jsx)
  // PromotionSection 이 onToggleSave(promotion.id, saved) 로 부르므로 toggleSave 를 그대로 넘김
  const { isSaved, toggleSave } = useSavedPromotions();

  useEffect(() => {
    let isCurrent = true;

    getPromotions(TODAY_FILTER_PARAMS[activeFilter])
      .then((response) => {
        if (isCurrent) {
          setTodayState({
            results: Array.isArray(response?.results) ? response.results : [],
            loading: false,
            error: false,
          });
        }
      })
      .catch(() => {
        if (isCurrent) {
          setTodayState({ results: [], loading: false, error: true });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [activeFilter]);

  useEffect(() => {
    let isCurrent = true;

    getPromotions({ featured: true })
      .then((response) => {
        if (isCurrent) {
          setTrendingState({
            results: Array.isArray(response?.results) ? response.results : [],
            loading: false,
            error: false,
          });
        }
      })
      .catch(() => {
        if (isCurrent) {
          setTrendingState({ results: [], loading: false, error: true });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const todayPromotions = useMemo(
    () =>
      todayState.results.map((promotion) =>
        toCardPromotion(promotion, isSaved),
      ),
    [todayState.results, isSaved],
  );

  const trendingPromotions = useMemo(
    () =>
      trendingState.results.map((promotion) =>
        toCardPromotion(promotion, isSaved),
      ),
    [trendingState.results, isSaved],
  );

  const bannerPromotion = trendingPromotions[0];
  const goToDetail = (id) => navigate(`/promotions/${id}`);
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setTodayState({ results: [], loading: true, error: false });
  };

  return (
    <main className="mx-auto min-h-dvh max-w-[402px] bg-brand-surface pb-28">
      <TopBar
        onLogoClick={() => navigate("/home")}
        onBookmarkClick={() => navigate("/saved")}
      />
      <div className="px-5 pt-[7px]">
        <SearchBar readOnly onClick={() => navigate("/search")} />
      </div>
      <div className="mt-5">
        <MainPromotionBanner
          promotion={bannerPromotion}
          onClick={
            bannerPromotion ? () => goToDetail(bannerPromotion.id) : undefined
          }
        />
      </div>
      <div className="flex flex-col gap-4 px-5 pt-5">
        <PromotionSection
          title="오늘의 프로모션"
          icon={todayPromotionIcon}
          iconClassName="h-6 w-6"
          promotions={todayPromotions}
          filters={TODAY_FILTERS}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          showMore
          onMoreClick={() => navigate("/promotions")}
          onPromotionClick={goToDetail}
          onToggleSave={toggleSave}
        />
        <PromotionStateMessage
          loading={todayState.loading}
          error={todayState.error}
          isEmpty={todayPromotions.length === 0}
        />
        <PromotionSection
          title="지금 뜨는 프로모션"
          icon={trendingFireIcon}
          iconClassName="h-[19.763px] w-[18px]"
          promotions={trendingPromotions}
          onPromotionClick={goToDetail}
          onToggleSave={toggleSave}
        />
        <PromotionStateMessage
          loading={trendingState.loading}
          error={trendingState.error}
          isEmpty={trendingPromotions.length === 0}
        />
      </div>
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-20 mx-auto w-[min(362px,calc(100%-40px))]">
        <GNB
          active="home"
          className="pointer-events-auto shadow-[0_4px_12px_rgba(136,83,0,0.08)]"
        />
      </div>
    </main>
  );
}
