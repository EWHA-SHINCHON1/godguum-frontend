import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GNB, SearchBar, TopBar } from "../../components/common";
import MainPromotionBanner from "../../components/home/MainPromotionBanner";
import PromotionSection from "../../components/home/PromotionSection";
import todayPromotionIcon from "../../assets/icons/promotion-today.svg";
import trendingFireIcon from "../../assets/icons/trending-fire.svg";

const TODAY_FILTERS = ["전체", "진행중", "곧 시작", "오늘 마감"];

const TODAY_PROMOTIONS = [
  { id: 1, storeName: "카페 오브제", benefit: "아메리카노 1000원 할인", dDay: "D-3", status: "진행중", saved: true },
  { id: 2, storeName: "브레드 홀릭", benefit: "소금빵 1+1", dDay: "D-1", status: "오늘 마감" },
  { id: 3, storeName: "달콤 베이커리", benefit: "케이크 10% 할인", dDay: "D-5", status: "진행중" },
  { id: 4, storeName: "커피리브레", benefit: "신메뉴 무료 업그레이드", dDay: "D-7", status: "곧 시작" },
];

const TRENDING_PROMOTIONS = [
  { id: 11, storeName: "카페 오브제", benefit: "아메리카노 1000원 할인", dDay: "D-3", saved: true },
  { id: 12, storeName: "오후의 디저트", benefit: "전 메뉴 15% 할인", dDay: "D-2" },
  { id: 13, storeName: "모닝 테이블", benefit: "브런치 음료 무료", dDay: "D-4" },
  { id: 14, storeName: "베이크스테이션", benefit: "쿠키 세트 증정", dDay: "D-6" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("전체");
  const todayPromotions = useMemo(
    () => TODAY_PROMOTIONS.filter((promotion) => activeFilter === "전체" || promotion.status === activeFilter),
    [activeFilter],
  );

  return (
    <main className="mx-auto min-h-dvh w-full max-w-[402px] bg-brand-surface pb-28">
      <TopBar />
      <div className="px-5 pt-[7px]">
        <SearchBar 
          readOnly
          onClick={() => navigate("/search")} 
        />
      </div>
      <div className="mt-5">
        <MainPromotionBanner />
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
        />
        <PromotionSection
          title="지금 뜨는 프로모션"
          icon={trendingFireIcon}
          iconClassName="h-[19.763px] w-[18px]"
          promotions={TRENDING_PROMOTIONS}
        />
      </div>
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-20 mx-auto w-[min(362px,calc(100%-40px))]">
        <GNB active="home" className="pointer-events-auto shadow-[0_4px_12px_rgba(136,83,0,0.08)]" />
      </div>
    </main>
  );
}
