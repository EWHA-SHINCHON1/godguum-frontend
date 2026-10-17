import fallbackImage from "../../assets/images/owner/figma-raw-2.png";
import { formatSeoulDateDot } from "../../utils/date";

/**
 * 이용내역 화면용 — 사용 완료된 쿠폰 카드
 *
 * coupon 은 서버 응답(GET /me/coupons/?status=used)의 results 항목 하나 그대로
 *   coupon.used_at                  사용 일시
 *   coupon.promotion.title          프로모션 제목
 *   coupon.promotion.image_url      대표 이미지 (없을 수도 있음)
 *   coupon.promotion.store.name     매장명
 */
export default function UsedCouponCard({ coupon, onClick }) {
  // ?. : 중간 값이 비어 있어도 에러 없이 undefined 로 (서버 데이터가 덜 와도 화면이 안 깨지게)
  const promotion = coupon.promotion;
  const storeName = promotion?.store?.name ?? "";
  const title = promotion?.title ?? "";
  const imageUrl = promotion?.image_url || fallbackImage;
  const usedDate = formatSeoulDateDot(coupon.used_at);

  return (
    <article
      onClick={onClick}
      className="flex h-[115px] w-full cursor-pointer items-center gap-3 rounded-lg border-[0.5px] border-line bg-surface p-3"
    >
      <img
        src={imageUrl}
        alt={title}
        width={90}
        height={90}
        // 이미지 주소가 깨졌으면 기본 이미지로 교체 (한 번만)
        onError={(event) => {
          if (event.currentTarget.src !== fallbackImage) {
            event.currentTarget.src = fallbackImage;
          }
        }}
        className="size-[90px] shrink-0 rounded-[7.2px] object-cover"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-body3 font-medium tracking-[-0.012px] text-fg-muted">
          {storeName}
        </p>

        <h3 className="truncate text-body1 font-semibold leading-[150%] tracking-[-0.016px] text-fg">
          {title}
        </h3>

        {usedDate && (
          <p className="text-body3 font-medium tracking-[-0.012px] text-fg-muted">
            {usedDate} 사용 완료
          </p>
        )}
      </div>
    </article>
  );
}
