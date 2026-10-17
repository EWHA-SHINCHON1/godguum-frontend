import ticketIcon from "../../assets/icons/ticket.svg";
import { cn } from "./cn";

/**
 * 프로모션 상세 하단 고정 CTA (Figma: 쿠폰 발급, type=쿠폰 발급 / 쿠폰 없음)
 * hasCoupon=false 이면 회색 비활성 바로 바뀐다.
 *
 * inactive=true : 쿠폰형이지만 지금은 못 받는 상태 (진행 예정·소진·종료, 사용·만료된 내 쿠폰)
 *   → Figma "쿠폰 없음" 과 같은 회색 모양 + label 로 이유를 보여줌
 *   → 누를 수 있는지는 disabled 로 따로 정함 (예: 만료된 내 쿠폰은 회색이지만 눌러서 쿠폰함으로 이동)
 * (Figma 에 이 상태들 전용 디자인이 없어서 기존 두 모양을 재사용)
 */
export default function CouponIssueBar({
  hasCoupon = true,
  inactive = false,
  label = hasCoupon ? "쿠폰 발급받기" : "비쿠폰형",
  onClick,
  disabled,
  className,
}) {
  // 노란 바(발급 가능)로 보일지
  const isBrand = hasCoupon && !inactive;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !hasCoupon}
      className={cn(
        "flex h-[70px] w-full items-center justify-center gap-5 px-2.5",
        isBrand
          ? "bg-brand transition-opacity active:opacity-90 disabled:opacity-50"
          : "bg-[#eeeff1] disabled:cursor-default",
        className,
      )}
    >
      {isBrand && <img src={ticketIcon} alt="" width={28} height={28} />}
      <span
        className={cn(
          "text-head1 font-semibold tracking-[-0.02px]",
          isBrand ? "text-fg" : "text-fg-muted",
        )}
      >
        {label}
      </span>
    </button>
  );
}
