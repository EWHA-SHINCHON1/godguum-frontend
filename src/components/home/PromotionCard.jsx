import promotionImage from "../../assets/images/home/figma-raw-3.png";
import { Bookmark, cn } from "../common"; // [변경] cn 추가 import

// [변경] onClick props 추가: 카드 전체를 눌러 상세로 이동
export default function PromotionCard({ promotion, onClick, onToggleSave }) {
  return (
    <article
      onClick={onClick} // [변경] 추가
      className={cn(
        "flex w-[110px] shrink-0 flex-col items-start gap-2",
        onClick && "cursor-pointer", // [변경] 클릭 가능할 때만 포인터 커서
      )}
    >
      <div className="relative size-[110px] overflow-hidden rounded-md">
        <img
          src={promotion.image ?? promotionImage}
          alt={`${promotion.storeName} 프로모션`}
          className="size-full object-cover"
        />

        <Bookmark
          onToggle={onToggleSave} // 북마크는 Bookmark 내부 stopPropagation 덕분에 눌러도 상세로 이동하지 않음
          saved={promotion.saved}
          className="absolute right-[5.5px] top-[5.5px] size-4"
        />
      </div>

      <div className="flex w-full flex-col">
        <h3 className="truncate text-body2 font-semibold tracking-[-0.014px] text-black">
          {promotion.storeName}
        </h3>

        {/* [변경] promotion.benefit → promotion.title ?? promotion.benefit
            MOCK_PROMOTIONS 에는 benefit 대신 title 필드가 있어서 title 을 우선 사용 */}
        <p className="w-full truncate text-caption1 font-medium tracking-[-0.011px] text-fg-muted">
          {promotion.title ?? promotion.benefit}
        </p>

        <p className="text-body3 font-semibold tracking-[-0.012px] text-brand-strong">
          {promotion.dDay}
        </p>
      </div>
    </article>
  );
}
