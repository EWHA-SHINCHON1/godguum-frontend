import { cn } from "../common";
import PromotionListCard from "../promotion/PromotionListCard";

/**
 * 내 쿠폰 카드 (Figma: 쿠폰, type=사용하기 / 사용완료 / 기간만료)
 * 왼쪽 정보 영역은 PromotionListCard 를 그대로 쓰고, 상태별 오른쪽 버튼·딤 처리만 더한다.
 */
const ACTIONS = {
  available: {
    label: "사용하기",
    className: "bg-brand-weak text-brand-strong",
  },
  used: {
    label: "사용완료",
    className: "cursor-default bg-surface-subtle text-fg-muted",
  },
};

export default function CouponCard({ coupon, onClick, onUse }) {
  const { promotion, status } = coupon;

  if (status === "expired") {
    return (
      <div className="relative w-full">
        <PromotionListCard
          promotion={{ ...promotion, dDay: "기간 만료" }}
          showBookmark={false}
          dDayClassName="text-fg-muted"
        />
        {/* Figma: 필터 (rgba(244,244,244,0.6)) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-lg bg-[rgba(244,244,244,0.6)]"
        />
      </div>
    );
  }

  const action = ACTIONS[status];

  return (
    <div className="flex w-full items-center">
      <PromotionListCard
        promotion={promotion}
        showBookmark={false}
        onClick={onClick}
        className="min-w-0 flex-1"
      />
      <button
        type="button"
        onClick={status === "available" ? onUse : undefined}
        disabled={status !== "available"}
        className={cn(
          "flex h-[114px] shrink-0 items-center justify-center rounded-lg px-3 py-1.5",
          "text-body3 font-semibold tracking-[-0.012px] whitespace-nowrap",
          action.className,
        )}
      >
        {action.label}
      </button>
    </div>
  );
}
