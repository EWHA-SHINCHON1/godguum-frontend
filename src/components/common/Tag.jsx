import { cn } from "./cn";

/**
 * 필터 칩 (Figma: Tag, selected=true/false)
 * 전체 / 진행 중 / 곧 시작 / 오늘 마감
 */
export default function Tag({
  selected = false,
  onClick,
  className,
  children,
  ...props
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-3 py-1.5",
        "text-body3 font-medium whitespace-nowrap transition-colors",
        selected ? "bg-brand text-fg" : "bg-brand-weak text-fg-muted",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
