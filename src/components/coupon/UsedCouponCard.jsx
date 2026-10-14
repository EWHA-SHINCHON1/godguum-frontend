import promotionImage from "../../assets/images/owner/figma-raw-2.png";
import { formatDate } from "../../mocks/coupons";

/**
 * 이용내역 화면용 — 사용 완료된 쿠폰 카드
 */
export default function UsedCouponCard({ coupon, onClick }) {
  const {
    usedAt,
    promotion: { storeName, title },
  } = coupon; // 필요한 값만 꺼내기

  return (
    <article
      onClick={onClick}
      className="flex h-[115px] w-full cursor-pointer items-center gap-3 rounded-lg border-[0.5px] border-line bg-surface p-3"
    >
      <img
        src={promotionImage} //image 속성 없어서 안넣음. 추후 수정 필요
        alt={`프로모션`}
        width={90}
        height={90}
        className="size-[90px] shrink-0 rounded-[7.2px] object-cover"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-body3 font-medium tracking-[-0.012px] text-fg-muted">
          {storeName}
        </p>

        <h3 className="truncate text-body1 font-semibold leading-[150%] tracking-[-0.016px] text-fg">
          {title}
        </h3>

        <p className="text-body3 font-medium tracking-[-0.012px] text-fg-muted">
          {usedAt} 사용 완료
        </p>
      </div>
    </article>
  );
}
