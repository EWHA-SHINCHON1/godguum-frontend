import promotionImage from "../../assets/images/owner/figma-raw-2.png";
import { Bookmark } from "../common";

/**
 * 세로 목록용 프로모션 카드 (Figma: 저장 프로모션 카드)
 * 전체 프로모션 목록 / 저장한 프로모션 화면에서 사용
 */
export default function PromotionListCard({ promotion, onClick, onToggleSave }) {
  return (
    <article
      onClick={onClick}
      className="flex h-[115px] w-full cursor-pointer items-center gap-3 rounded-lg border-[0.5px] border-line bg-surface p-3"
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

          <p className="text-body3 font-medium tracking-[-0.012px] text-fg-muted">
            {promotion.period}
          </p>

          <p className="text-body3 font-semibold tracking-[-0.012px] text-brand-strong">
            {promotion.dDay}
          </p>
        </div>

        <Bookmark
          saved={promotion.saved}
          onToggle={onToggleSave}
          size={24}
          className="size-6"
        />
      </div>
    </article>
  );
}
