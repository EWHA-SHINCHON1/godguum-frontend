import ticketIcon from "../../assets/icons/ticket.svg";
import { cn } from "./cn";

/**
 * 프로모션 상세 하단 고정 CTA (Figma: 쿠폰 발급, type=쿠폰 발급 / 쿠폰 없음)
 * hasCoupon=false 이면 회색 비활성 바로 바뀐다.
 */
export default function CouponIssueBar({
  hasCoupon = true,
  label = hasCoupon ? "쿠폰 발급받기" : "비쿠폰형",
  onClick,
  disabled,
  className,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !hasCoupon}
      className={cn(
        "flex h-[70px] w-full items-center justify-center gap-5 px-2.5",
        hasCoupon
          ? "bg-brand transition-opacity active:opacity-90 disabled:opacity-50"
          : "cursor-default bg-[#eeeff1]",
        className,
      )}
    >
      {hasCoupon && <img src={ticketIcon} alt="" width={28} height={28} />}
      <span
        className={cn(
          "text-head1 font-semibold tracking-[-0.02px]",
          hasCoupon ? "text-fg" : "text-fg-muted",
        )}
      >
        {label}
      </span>
    </button>
  );
}
