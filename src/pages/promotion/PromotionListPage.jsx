import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GNB, SearchBar, Tag, TopBar } from "../../components/common";
import PromotionListCard from "../../components/promotion/PromotionListCard";
import { getPromotions } from "../../api/promotions";
import { getDday, formatSeoulDate } from "../../utils/date";
import { useSavedPromotions } from "../../store/savedPromotions";

const PROMOTION_FILTERS = ["전체", "진행중", "곧 시작", "오늘 마감"];

// 각 필터에 대응하는 api 응답 지정
// 따옴표는 띄어쓰기 때문에 삽입
const FILTER_PARAMS = {
  전체: {},
  진행중: { period: "ongoing" },
  "곧 시작": { status: "upcoming" },
  "오늘 마감": { closing_today: true, period: "ongoing" },
};

// api 응답 전달
function toListCard(promotion, isSaved) {
  return {
    id: promotion.id,
    title: promotion.title,
    storeName: promotion.store.name,
    image: promotion.image_url,
    period: `${formatSeoulDate(promotion.starts_at)} ~ ${formatSeoulDate(promotion.ends_at)}`,
    dDay: getDday(promotion.ends_at),
    saved: isSaved(promotion.id),
  };
}

export default function PromotionListPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("전체");
  const { isSaved, setSaved } = useSavedPromotions();

  const [state, setState] = useState({
    results: [],
    loading: true,
    error: null,
  });

  // card 가 받을 수 있는 모양으로 변경 (map에 바로 넣게)
  const filteredPromotions = useMemo(
    () => state.results.map((promotion) => toListCard(promotion, isSaved)),
    [state.results, isSaved],
  );

  useEffect(() => {
    let isCurrent = true;

    getPromotions(FILTER_PARAMS[activeFilter])
      .then((data) => {
        if (isCurrent) {
          setState({ results: data.results, loading: false, error: null });
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setState({ results: [], loading: false, error });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [activeFilter]);

  return (
    <main className="mx-auto min-h-dvh max-w-[402px] bg-brand-surface pb-28">
      <TopBar
        onLogoClick={() => navigate("/home")}
        onBookmarkClick={() => navigate("/saved")}
      />

      <div className="flex flex-col gap-4 px-5 pt-2">
        <SearchBar readOnly onClick={() => navigate("/search")} />

        <section className="flex flex-col gap-3" aria-label="전체 프로모션">
          <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {PROMOTION_FILTERS.map((filter) => (
              <Tag
                key={filter}
                selected={filter === activeFilter}
                onClick={() => {
                  setActiveFilter(filter);
                  // 탭을 누르면 바로 로딩 상태로 리셋 (이전 탭 결과가 남아 보이지 않게)
                  setState({ results: [], loading: true, error: null });
                }}
                className="px-4"
              >
                {filter}
              </Tag>
            ))}
          </div>

          {/* 로딩 → 에러 → 결과 있음 → 결과 없음 순서로 검사 */}
          {state.loading ? (
            <p className="py-20 text-center text-body2 font-medium text-fg-muted">
              불러오는 중이에요
            </p>
          ) : state.error ? (
            <p className="py-20 text-center text-body2 font-medium text-fg-muted">
              프로모션을 불러오지 못했어요
            </p>
          ) : filteredPromotions.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {filteredPromotions.map((promotion) => (
                <li key={promotion.id}>
                  <PromotionListCard
                    promotion={promotion}
                    onClick={() => navigate(`/promotions/${promotion.id}`)}
                    onToggleSave={(saved) => setSaved(promotion.id, saved)}
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
          className="pointer-events-auto shadow-[0_4px_12px_rgba(136,83,0,0.08)]"
        />
      </div>
    </main>
  );
}
