import promotionImage from "../../assets/images/home/figma-raw-3.png";
import { Bookmark } from "../common";

export default function PromotionCard({ promotion }) {
  return (
    <article className="flex w-[110px] shrink-0 flex-col items-start gap-2">
      <div className="relative size-[110px] overflow-hidden rounded-md">
        <img
          src={promotion.image ?? promotionImage}
          alt={`${promotion.storeName} 프로모션`}
          className="size-full object-cover"
        />

        <Bookmark
          saved={promotion.saved}
          className="absolute right-[5.5px] top-[5.5px] size-4"
        />
      </div>

      <div className="flex w-full flex-col">
        <h3 className="truncate text-body2 font-semibold tracking-[-0.014px] text-black">
          {promotion.storeName}
        </h3>

        <p className="w-full truncate text-caption1 font-medium tracking-[-0.011px] text-fg-muted">
          {promotion.benefit}
        </p>

        <p className="text-body3 font-semibold tracking-[-0.012px] text-brand-strong">
          {promotion.dDay}
        </p>
      </div>
    </article>
  );
}
