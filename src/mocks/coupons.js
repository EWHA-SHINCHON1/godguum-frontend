// TODO: API 연동 전 mock 데이터 (마이 · 내 쿠폰 · 이용내역에서 함께 사용)
import { MOCK_PROMOTIONS } from "./promotions";

export const MOCK_USER = {
  name: "김이화",
  greeting: "오늘도 맛있는 하루!",
};

/**
 * status
 *  - available : 사용 가능
 *  - used      : 사용 완료 (usedAt 있음)
 *  - expired   : 기간 만료
 */
const COUPONS = [
  { id: 101, promotionId: 1, status: "available" },
  { id: 102, promotionId: 2, status: "available" },
  { id: 103, promotionId: 4, status: "available" },
  { id: 104, promotionId: 1, status: "used", usedAt: "2025-10-08" },
  { id: 105, promotionId: 5, status: "used", usedAt: "2025-10-02" },
  { id: 106, promotionId: 7, status: "used", usedAt: "2025-09-27" },
  { id: 107, promotionId: 2, status: "expired" },
  { id: 108, promotionId: 5, status: "expired" },
];

/** 쿠폰마다 프로모션 정보(storeName, title, period, dDay)를 붙여서 돌려준다. */
export const MOCK_COUPONS = COUPONS.map((coupon) => ({
  ...coupon,
  promotion: MOCK_PROMOTIONS.find(
    (promotion) => promotion.id === coupon.promotionId,
  ),
}));

export function getCoupon(id) {
  return (
    MOCK_COUPONS.find((coupon) => String(coupon.id) === String(id)) ?? null
  );
}

/** "2025-10-08" → "2025. 10. 08" */
export function formatDate(isoDate) {
  return isoDate.replaceAll("-", ". ");
}
