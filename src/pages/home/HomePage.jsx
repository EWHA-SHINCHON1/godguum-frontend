import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GNB, SearchBar, TopBar } from "../../components/common";
import MainPromotionBanner from "../../components/home/MainPromotionBanner";
import PromotionSection from "../../components/home/PromotionSection";
import { MOCK_PROMOTIONS } from "../../mocks/promotions"; // [변경] 추가: 프로모션 목록 페이지와 같은 mock 사용
import { useSavedPromotions } from "../../store/savedPromotions"; // [변경] 추가: 저장 상태를 다른 화면과 공유
import todayPromotionIcon from "../../assets/icons/promotion-today.svg";
import trendingFireIcon from "../../assets/icons/trending-fire.svg";

const TODAY_FILTERS = ["전체", "진행중", "곧 시작", "오늘 마감"];

// [변경] 삭제: 홈 전용 하드코딩 데이터 TODAY_PROMOTIONS, TRENDING_PROMOTIONS
//        → MOCK_PROMOTIONS 로 대체

// [변경] 추가
// TODO: API 연동 전까지 홈 노출 프로모션은 MOCK_PROMOTIONS 에서 id 로 골라서 사용
const MAIN_BANNER_PROMOTION_ID = 6; // 카페 올베르 · 수업 끝나고 달달하게
const TRENDING_PROMOTION_IDS = [2, 7, 5, 1];

export default function HomePage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("전체");
  const { isSaved, setSaved } = useSavedPromotions(); // [변경] 추가

  // [변경] TODAY_PROMOTIONS → MOCK_PROMOTIONS 필터링 + 저장 상태(saved) 반영
  const todayPromotions = useMemo(
    () =>
      MOCK_PROMOTIONS.filter(
        (promotion) =>
          activeFilter === "전체" || promotion.status === activeFilter,
      ).map((promotion) => ({ ...promotion, saved: isSaved(promotion.id) })),
    [activeFilter, isSaved],
  );

  // [변경] 추가: 지금 뜨는 프로모션 = TRENDING_PROMOTION_IDS 순서대로 MOCK_PROMOTIONS 에서 꺼냄
  const trendingPromotions = useMemo(
    () =>
      TRENDING_PROMOTION_IDS.map((id) =>
        MOCK_PROMOTIONS.find((promotion) => promotion.id === id),
      )
        .filter(Boolean)
        .map((promotion) => ({ ...promotion, saved: isSaved(promotion.id) })),
    [isSaved],
  );

  // [변경] 추가: 대표 배너에 연결할 프로모션
  const bannerPromotion = MOCK_PROMOTIONS.find(
    (promotion) => promotion.id === MAIN_BANNER_PROMOTION_ID,
  );

  // [변경] 추가: 상세 화면 이동 (PromotionListPage 와 같은 경로)
  const goToDetail = (id) => navigate(`/promotions/${id}`);

  return (
    <main className="mx-auto min-h-dvh max-w-[402px] bg-brand-surface pb-28">
      {/* [변경] 로고 → /home, 북마크 → /saved 연결 (목록 페이지와 동일) */}
      <TopBar
        onLogoClick={() => navigate("/home")}
        onBookmarkClick={() => navigate("/saved")}
      />
      <div className="px-5 pt-[7px]">
        <SearchBar readOnly onClick={() => navigate("/search")} />
      </div>
      <div className="mt-5">
        {/* [변경] promotion, onClick 전달 → 배너 클릭 시 /promotions/6 */}
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
          onFilterChange={setActiveFilter}
          showMore
          onMoreClick={() => navigate("/promotions")} // [변경] 추가: 더보기 → 전체 목록
          onPromotionClick={goToDetail} // [변경] 추가: 카드 → 상세
          onToggleSave={setSaved} // [변경] 추가: 북마크 저장/취소
        />
        <PromotionSection
          title="지금 뜨는 프로모션"
          icon={trendingFireIcon}
          iconClassName="h-[19.763px] w-[18px]"
          promotions={trendingPromotions} // [변경] TRENDING_PROMOTIONS → trendingPromotions
          onPromotionClick={goToDetail} // [변경] 추가: 카드 → 상세
          onToggleSave={setSaved} // [변경] 추가: 북마크 저장/취소
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
