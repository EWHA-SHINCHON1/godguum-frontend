import promotionImage from "../../assets/images/owner/figma-raw-2.png";
import { Bookmark, cn } from "../common";

/**
 * 세로 목록용 프로모션 카드 (Figma: 저장 프로모션 카드)
 * 전체 프로모션 목록 / 저장한 프로모션 / 내 쿠폰(CouponCard 안) 화면에서 사용
 *
 * 추가 옵션 (안 넘기면 예전과 똑같이 동작)
 *   className      바깥에서 크기·모양 조절 (예: CouponCard 는 "min-w-0 flex-1" → 버튼 옆 남은 폭만 차지)
 *   showBookmark   false 면 북마크 아이콘 숨김 (내 쿠폰 카드는 북마크 없음 — Figma)
 *   dDayClassName  D-day 글자 색 바꾸기 (기간 만료 카드는 회색)
 */
export default function PromotionListCard({
  promotion,
  onClick,
  onToggleSave,
  className,
  showBookmark = true,
  dDayClassName,
}) {
  return (
    <article
      onClick={onClick}
      // min-w-0: flex 안에서 글자가 길어도 카드가 늘어나지 않고 줄어들 수 있게
      //          (이게 없으면 긴 제목 때문에 카드가 밀려나서 옆 버튼이 화면 밖으로 나감)
      className={cn(
        "flex h-[115px] w-full min-w-0 cursor-pointer items-center gap-3 rounded-lg border-[0.5px] border-line bg-surface p-3",
        className,
      )}
    >
      <img
        src={promotion.image ?? promotionImage}
        alt={`${promotion.storeName} 프로모션`}
        width={90}
        height={90}
        className="size-[90px] shrink-0 rounded-[7.2px] object-cover"
      />

      <div className="flex h-[90px] min-w-0 flex-1 items-start justify-between gap-5">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate text-body3 font-medium tracking-[-0.012px] text-fg-muted">
            {promotion.storeName}
          </p>

          <h3 className="truncate text-body1 font-semibold leading-[150%] tracking-[-0.016px] text-fg">
            {promotion.title}
          </h3>

          {/* truncate: 한 줄을 넘으면 "..." 으로 생략 */}
          <p className="truncate text-body3 font-medium tracking-[-0.012px] text-fg-muted">
            {promotion.period}
          </p>

          <p
            className={cn(
              "truncate text-body3 font-semibold tracking-[-0.012px] text-brand-strong",
              dDayClassName,
            )}
          >
            {promotion.dDay}
          </p>
        </div>

        {showBookmark && (
          <Bookmark
            saved={promotion.saved}
            onToggle={onToggleSave}
            size={24}
            className="size-6"
          />
        )}
      </div>
    </article>
  );
}
