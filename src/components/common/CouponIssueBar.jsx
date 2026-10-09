import ticketIcon from "../../assets/icons/ticket.svg";
import { cn } from "./cn";

/**
 * 프로모션 상세 하단 고정 CTA (Figma: 쿠폰 발급하기 버튼)
 */
export default function CouponIssueBar({
  label = "쿠폰 발급받기",
  onClick,
  disabled,
  className,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-[70px] w-full items-center justify-center gap-5 bg-brand px-2.5",
        "transition-opacity active:opacity-90 disabled:opacity-50",
        className,
      )}
    >
      <img src={ticketIcon} alt="" width={28} height={28} />
      <span className="text-head1 font-semibold text-fg-inverse">{label}</span>
    </button>
  );
}
