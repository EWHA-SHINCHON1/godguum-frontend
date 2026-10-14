import PromotionCard from "./PromotionCard";
import { Tag } from "../common";
import { cn } from "../common/cn";
import chevronRightMuted from "../../assets/icons/chevron-right-muted.svg";

export default function PromotionSection({
  title,
  icon,
  iconClassName,
  promotions,
  filters,
  activeFilter,
  onFilterChange,
  showMore = false,
  onMoreClick, // [변경] 추가: 더보기 클릭 시 실행 (홈 → /promotions 이동)
  onPromotionClick, // [변경] 추가: 카드 클릭 시 실행 (홈 → /promotions/:id 상세 이동)
  onToggleSave, // [변경] 추가: 기존엔 props로 안 받아서 북마크가 동작하지 않던 버그 수정
}) {
  return (
    <section
      className="flex flex-col gap-3"
      aria-labelledby={`${title}-heading`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {icon && (
            <img
              src={icon}
              alt=""
              aria-hidden="true"
              className={cn("shrink-0", iconClassName)}
            />
          )}
          <h2
            id={`${title}-heading`}
            className="text-body1 font-semibold leading-[150%] tracking-[-0.016px] text-fg"
          >
            {title}
          </h2>
        </div>
        {showMore && (
          <button
            type="button"
            onClick={onMoreClick} // [변경] 추가: 더보기 버튼 클릭 연결
            className="flex h-6 items-center gap-1 text-body3 font-medium tracking-[-0.012px] text-fg-muted"
          >
            더보기
            <img
              src={chevronRightMuted}
              alt=""
              aria-hidden="true"
              className="shrink-0"
            />
          </button>
        )}
      </div>

      {filters && (
        <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filters.map((filter) => (
            <Tag
              key={filter}
              selected={filter === activeFilter}
              onClick={() => onFilterChange(filter)}
            >
              {filter}
            </Tag>
          ))}
        </div>
      )}

      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {promotions.map((promotion) => (
          <PromotionCard
            key={promotion.id}
            promotion={promotion}
            onClick={() => onPromotionClick?.(promotion.id)} // [변경] 추가: 카드 클릭 시 해당 id 전달
            onToggleSave={(saved) => onToggleSave?.(promotion.id, saved)}
          />
        ))}
      </div>
    </section>
  );
}
