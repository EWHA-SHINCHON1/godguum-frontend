import { useNavigate } from "react-router-dom";
import promotionImage from "../../assets/images/owner/owner-performance-promotion.png";
import externalClicksIcon from "../../assets/icons/owner/performance-external-clicks.svg";
import couponsIcon from "../../assets/icons/owner/performance-coupons.svg";
import viewsIcon from "../../assets/icons/owner/performance-views.svg";
import storeForwardIcon from "../../assets/icons/owner/owner-store-forward.svg";
import { Header } from "../../components/common";
import PerformanceStatCard from "../../components/owner/PerformanceStatCard";

const PROMOTION = {
  storeName: "무시무시",
  name: "심야 베이커리 스탬프 프로모션",
  period: "26.11.06 ~ 26.11.08",
  dDay: "D-3",
  image: promotionImage,
};

const PERFORMANCE_STATS = [
  { key: "views", label: "상세 페이지 조회수", value: "320회", icon: viewsIcon },
  {
    key: "external-clicks",
    label: "외부 채널 클릭 수",
    value: "18회",
    icon: externalClicksIcon,
    iconWidth: 18,
    iconHeight: 18,
  },
  { key: "coupon-issued", label: "쿠폰 발급 수", value: "60회", icon: couponsIcon },
  { key: "coupon-used", label: "쿠폰 사용 수", value: "24회", icon: couponsIcon },
];

export default function OwnerPerformancePage() {
  const navigate = useNavigate();

  return (
    <main className="mx-auto min-h-dvh max-w-[402px] bg-brand-surface">
      <Header
        title="프로모션 성과"
        onBack={() => navigate(-1)}
        className="h-[50px] bg-brand-surface"
        titleClassName="text-[20px] font-semibold leading-[140%] tracking-[-0.02px] text-fg"
      />

      <div className="px-6">
        <section aria-labelledby="promotion-name">
          <img
            src={PROMOTION.image}
            alt={`${PROMOTION.storeName} ${PROMOTION.name}`}
            className="aspect-square w-full object-cover"
          />
          <div className="mt-[15px] flex flex-col gap-0.5">
            <div className="flex items-center gap-[3px] text-body1 font-medium tracking-[-0.016px] text-fg-muted">
              <span>{PROMOTION.storeName}</span>
              <img src={storeForwardIcon} alt="" width={12} height={22} />
            </div>
            <h1
              id="promotion-name"
              className="text-[20px] font-medium leading-[140%] tracking-[-0.02px] text-fg"
            >
              {PROMOTION.name}
            </h1>
            <p className="text-body1 font-medium tracking-[-0.016px] text-fg-muted">
              {PROMOTION.period}
            </p>
            <p className="text-body1 font-semibold leading-[1.5] tracking-[-0.016px] text-brand-strong">{PROMOTION.dDay}</p>
          </div>
        </section>

        <section className="mt-[30px] grid grid-cols-2 gap-x-[14px] gap-y-[30px]" aria-label="프로모션 성과 지표">
          {PERFORMANCE_STATS.map(({ key, ...stat }) => (
            <PerformanceStatCard
              key={key}
              {...stat}
            />
          ))}
        </section>
      </div>
    </main>
  );
}
