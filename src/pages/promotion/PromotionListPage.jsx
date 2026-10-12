import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GNB, SearchBar, Tag, TopBar } from "../../components/common";
import PromotionListCard from "../../components/promotion/PromotionListCard";
import { MOCK_PROMOTIONS } from "../../mocks/promotions";

const PROMOTION_FILTERS = ["전체", "진행중", "곧 시작", "오늘 마감"];

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
                    onClick={() => navigate(`/promotions/${promotion.id}`)}
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
        <GNB active="promotion" className="pointer-events-auto shadow-[0_4px_12px_rgba(136,83,0,0.08)]" />
      </div>
    </main>
  );
}
