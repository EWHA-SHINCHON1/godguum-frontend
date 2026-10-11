import promotionImage from "../../assets/images/owner/figma-raw-2.png";

export default function OwnerPromotionCard({ promotion, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[115px] w-full items-center gap-3 rounded-lg border-[0.5px] border-line bg-surface p-3 text-left"
      aria-label={`${promotion.name} 프로모션 성과 보기`}
    >
      <img
        src={promotion.image ?? promotionImage}
        alt={`${promotion.storeName} 프로모션`}
        width={90}
        height={90}
        className="size-[90px] shrink-0 rounded-[7.2px] object-cover"
      />
      <div className="flex h-[90px] min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-body3 font-medium tracking-[-0.012px] text-fg-muted">
          {promotion.storeName}
        </p>

        <h2 className="truncate text-body1 font-semibold leading-[150%] tracking-[-0.016px] text-fg">
          {promotion.name}
        </h2>

        <p className="text-body3 font-medium tracking-[-0.012px] text-fg-muted">
          {promotion.period}
        </p>

        <p className="text-body3 font-semibold tracking-[-0.012px] text-brand-strong">
          {promotion.dDay}
        </p>
      </div>
    </button>
  );
}
