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
            onToggleSave={(saved) => onToggleSave?.(promotion.id, saved)}
          /> // 북마크 접근 위해 onToggleSave 삽입
        ))}
      </div>
    </section>
  );
}
