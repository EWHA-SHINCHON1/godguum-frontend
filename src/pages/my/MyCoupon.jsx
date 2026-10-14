import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header, SegmentedTabs } from "../../components/common";
import CouponCard from "../../components/coupon/CouponCard";
import { MOCK_COUPONS } from "../../mocks/coupons";

const TABS = [
  { value: "available", label: "사용 가능", empty: "사용 가능한 쿠폰이 없어요" },
  { value: "used", label: "사용 완료", empty: "사용 완료한 쿠폰이 없어요" },
  { value: "expired", label: "기간 만료", empty: "기간 만료된 쿠폰이 없어요" },
];

/**
 * 4-3-1 / 4-3-2 내 쿠폰 (사용 가능 · 사용 완료 · 기간 만료)
 * 선택한 탭은 ?tab= 으로 들고 있어서, 쿠폰 사용 후 돌아와도 탭이 유지된다.
 */
export default function MyCoupon() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = TABS.some((item) => item.value === searchParams.get("tab"))
    ? searchParams.get("tab")
    : "available";

  const tabItems = useMemo(
    () =>
      TABS.map((item) => ({
        value: item.value,
        label: `${item.label} (${MOCK_COUPONS.filter((coupon) => coupon.status === item.value).length})`,
      })),
    [],
  );

  const coupons = MOCK_COUPONS.filter((coupon) => coupon.status === tab);
  const emptyText = TABS.find((item) => item.value === tab).empty;

  return (
    <main className="mx-auto flex min-h-dvh max-w-[402px] flex-col bg-brand-surface pb-10">
      <Header title="내 쿠폰" onBack={() => navigate(-1)} className="bg-transparent" />

      <SegmentedTabs
        variant="underline"
        items={tabItems}
        value={tab}
        onChange={(next) => setSearchParams({ tab: next }, { replace: true })}
      />

      {coupons.length > 0 ? (
        <ul className="flex flex-col gap-3 px-5 pt-8" aria-label="쿠폰 목록">
          {coupons.map((coupon) => (
            <li key={coupon.id}>
              <CouponCard
                coupon={coupon}
                onClick={() => navigate(`/promotions/${coupon.promotionId}`)}
                onUse={() => navigate(`/my/coupons/${coupon.id}/use`)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex flex-1 items-center justify-center text-body2 font-medium text-fg-muted">
          {emptyText}
        </p>
      )}
    </main>
  );
}
