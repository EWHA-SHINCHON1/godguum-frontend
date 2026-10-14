import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { GNB, Header } from "../../components/common";
import UsedCouponCard from "../../components/coupon/UsedCouponCard";
import { MOCK_COUPONS, formatDate } from "../../mocks/coupons";

/** 4-2 이용내역 — 사용 완료한 쿠폰을 최근 순으로 보여준다. */
export default function MyHistory() {
  const navigate = useNavigate();

  const histories = useMemo(
    () =>
      MOCK_COUPONS.filter((coupon) => coupon.status === "used") //status가 used인 쿠폰들만 모아 배열로 반환 (React filter)
        .sort((a, b) => b.usedAt.localeCompare(a.usedAt)), //최신순 정렬
    /** .map((coupon) => ({
          id: coupon.id,
          promotionId: coupon.promotionId,
          storeName: coupon.promotion.storeName,
          title: coupon.promotion.title,
          period: `${formatDate(coupon.usedAt)} 사용 완료`,
        })), //map으로 카드에 뿌리기 // 컴포넌트 수정해야해서 없앰 (10.14fiX)*/
  );

  return (
    <main className="mx-auto flex min-h-dvh max-w-[402px] flex-col bg-brand-surface pb-28">
      <Header
        title="이용내역"
        onBack={() => navigate(-1)}
        className="bg-transparent"
      />

      {histories.length > 0 ? (
        <ul className="flex flex-col gap-3 px-5 pt-2" aria-label="이용내역">
          {histories.map((coupon) => (
            <li key={coupon.id}>
              <UsedCouponCard
                coupon={coupon}
                onClick={() => navigate(`/promotions/${coupon.promotionId}`)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex flex-1 items-center justify-center text-body2 font-medium text-fg-muted">
          아직 이용한 내역이 없어요
        </p>
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-20 mx-auto w-[min(362px,calc(100%-40px))]">
        <GNB
          active="my"
          className="pointer-events-auto shadow-[0_4px_12px_rgba(136,83,0,0.08)]"
        />
      </div>
    </main>
  );
}
