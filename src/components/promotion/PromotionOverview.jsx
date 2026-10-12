import storeChevron from "../../assets/icons/promotion/store-chevron.svg";
import conditionTicket from "../../assets/icons/promotion/condition-ticket.svg";
import { Bookmark } from "../common";

/**
 * 프로모션 상세 상단 (Figma: 프로모션) — 대표 이미지 · 가게/제목/기간 · 이용 조건
 */
export default function PromotionOverview({ promotion, onStoreClick, onToggleSave }) {
  return (
    <section aria-label="프로모션 개요">
      <img
        src={promotion.image}
        alt={`${promotion.title} 대표 이미지`}
        className="aspect-square w-full object-cover"
      />

      <div className="mt-4 flex items-start justify-between px-6">
        <div className="flex min-w-0 flex-col gap-0.5">
          <button
            type="button"
            onClick={onStoreClick}
            className="flex items-center gap-[3px] self-start text-body1 font-medium tracking-[-0.016px] text-fg-muted"
          >
            {promotion.storeName}
            <img src={storeChevron} alt="" width={12} height={22} />
          </button>

          <h2 className="text-head1 font-semibold tracking-[-0.02px] text-fg">
            {promotion.title}
          </h2>

          <p className="text-body1 font-medium tracking-[-0.016px] text-fg-muted">
            {promotion.period}
          </p>

          <p className="text-body1 font-semibold leading-[1.5] tracking-[-0.016px] text-brand-strong">
            {promotion.dDay}
          </p>
        </div>

        <Bookmark
          saved={promotion.saved}
          onToggle={onToggleSave}
          size={28.8}
          className="size-[28.8px]"
        />
      </div>

      <div className="px-5 py-[15px]">
        <div className="flex items-start gap-5 rounded-lg border-[0.5px] border-line bg-surface px-5 py-4">
          <span className="flex shrink-0 items-center gap-2 px-[15px] py-[3px] text-body3 font-semibold tracking-[-0.012px] whitespace-nowrap text-brand-contrast">
            <img src={conditionTicket} alt="" width={17} height={17} />
            이용 조건
          </span>
          <p className="min-w-0 flex-1 text-body3 tracking-[-0.012px]">
            <span className="block font-semibold text-fg">{promotion.condition.title}</span>
            <span className="block font-medium text-fg-muted">{promotion.condition.note}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
