import { cn } from "../common/cn";

/**
 * 프로모션 상세 탭 (프로모션 정보 / 가게 이야기) — 선택된 탭에 밑줄
 */
export default function PromotionDetailTabs({ items, value, onChange, className }) {
  return (
    <div role="tablist" className={cn("flex w-full border-t border-line", className)}>
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            id={`tab-${item.value}`}
            aria-selected={selected}
            aria-controls={`tabpanel-${item.value}`}
            onClick={() => onChange?.(item.value)}
            className={cn(
              "flex h-[50px] flex-1 items-center justify-center p-2.5 text-body1 tracking-[-0.016px] whitespace-nowrap",
              selected
                ? "border-b-[2.5px] border-fg font-semibold leading-[1.5] text-fg"
                : "font-medium text-fg-muted",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
