import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GNB, SearchBar, Tag, TopBar } from "../../components/common";
import PromotionListCard from "../../components/promotion/PromotionListCard";

const PROMOTION_FILTERS = ["전체", "진행중", "곧 시작", "오늘 마감"];

// TODO: API 연동 전 mock 데이터
const MOCK_PROMOTIONS = [
  { id: 1, storeName: "성무", title: "성무 취향 발견 주간", period: "26.11.06 ~ 26.11.08", dDay: "D-3", status: "진행중", saved: false },
  { id: 2, storeName: "카페 오브제", title: "아메리카노 1000원 할인", period: "26.11.01 ~ 26.11.05", dDay: "D-3", status: "진행중", saved: true },
  { id: 3, storeName: "브레드 홀릭", title: "소금빵 1+1", period: "26.10.28 ~ 26.11.03", dDay: "D-DAY", status: "오늘 마감", saved: true },
  { id: 4, storeName: "커피리브레", title: "신메뉴 무료 업그레이드", period: "26.11.10 ~ 26.11.16", dDay: "D-7", status: "곧 시작", saved: true },
  { id: 5, storeName: "달콤 베이커리", title: "케이크 10% 할인", period: "26.11.02 ~ 26.11.09", dDay: "D-5", status: "진행중", saved: true },
  { id: 6, storeName: "카페 올베르", title: "수업 끝나고 달달하게", period: "26.11.03 ~ 26.11.07", dDay: "D-4", status: "진행중", saved: true },
  { id: 7, storeName: "오후의 디저트", title: "전 메뉴 15% 할인", period: "26.10.30 ~ 26.11.03", dDay: "D-DAY", status: "오늘 마감", saved: false },
];

const NAV_PATHS = { home: "/home", promotion: "/promotions" };

export default function PromotionListPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("전체");
  const [promotions, setPromotions] = useState(MOCK_PROMOTIONS);

  const filteredPromotions = useMemo(
    () => promotions.filter((promotion) => activeFilter === "전체" || promotion.status === activeFilter),
    [promotions, activeFilter],
  );

  const toggleSave = (id, saved) => {
    setPromotions((prev) => prev.map((promotion) => (promotion.id === id ? { ...promotion, saved } : promotion)));
  };

  return (
    <main className="mx-auto min-h-dvh max-w-[402px] bg-brand-surface pb-28">
      <TopBar onLogoClick={() => navigate("/home")} />

      <div className="flex flex-col gap-4 px-5 pt-2">
        <SearchBar readOnly onClick={() => navigate("/search")} />

        <section className="flex flex-col gap-3" aria-label="전체 프로모션">
          <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {PROMOTION_FILTERS.map((filter) => (
              <Tag
                key={filter}
                selected={filter === activeFilter}
                onClick={() => setActiveFilter(filter)}
                className="px-4"
              >
                {filter}
              </Tag>
            ))}
          </div>

          {filteredPromotions.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {filteredPromotions.map((promotion) => (
                <li key={promotion.id}>
                  <PromotionListCard
                    promotion={promotion}
                    onToggleSave={(saved) => toggleSave(promotion.id, saved)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-20 text-center text-body2 font-medium text-fg-muted">
              해당하는 프로모션이 없어요
            </p>
          )}
        </section>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-20 mx-auto w-[min(362px,calc(100%-40px))]">
        <GNB
          active="promotion"
          onChange={(key) => NAV_PATHS[key] && navigate(NAV_PATHS[key])}
          className="pointer-events-auto shadow-[0_4px_12px_rgba(136,83,0,0.08)]"
        />
      </div>
    </main>
  );
}
