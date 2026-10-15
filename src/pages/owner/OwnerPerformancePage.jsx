import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import promotionImage from "../../assets/images/owner/owner-performance-promotion.png";
import externalClicksIcon from "../../assets/icons/owner/performance-external-clicks.svg";
import couponsIcon from "../../assets/icons/owner/performance-coupons.svg";
import infoIcon from "../../assets/icons/owner/performance-info.svg";
import viewsIcon from "../../assets/icons/owner/performance-views.svg";
import storeForwardIcon from "../../assets/icons/owner/owner-store-forward.svg";
import { Header } from "../../components/common";
import PerformanceStatCard from "../../components/owner/PerformanceStatCard";
import {
  clearOwnerToken,
  getOwnerPromotionStats,
  getStoredOwnerToken,
} from "../../api/owner";

const seoulDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function getSeoulDateParts(date) {
  return Object.fromEntries(
    seoulDateFormatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
}

function formatSeoulDate(dateValue) {
  const date = new Date(dateValue);

  if (!dateValue || Number.isNaN(date.getTime())) {
    return "";
  }

  const { year, month, day } = getSeoulDateParts(date);
  return `${String(year).slice(-2)}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
}

function getDday(endsAt) {
  const endDate = new Date(endsAt);

  if (!endsAt || Number.isNaN(endDate.getTime())) {
    return "";
  }

  const end = getSeoulDateParts(endDate);
  const today = getSeoulDateParts(new Date());
  const remainingDays = Math.round(
    (Date.UTC(end.year, end.month - 1, end.day) -
      Date.UTC(today.year, today.month - 1, today.day)) /
      (1000 * 60 * 60 * 24),
  );

  return remainingDays <= 0 ? "D-DAY" : `D-${remainingDays}`;
}

function formatCount(value) {
  return `${value ?? 0}회`;
}

function getInitialStatsState() {
  const hasToken = Boolean(getStoredOwnerToken());

  return {
    data: null,
    loading: hasToken,
    error: null,
    hasToken,
  };
}

export default function OwnerPerformancePage() {
  const navigate = useNavigate();
  const { promotionId } = useParams();
  const [statsState, setStatsState] = useState(getInitialStatsState);

  useEffect(() => {
    const ownerToken = getStoredOwnerToken();

    if (!ownerToken) {
      return undefined;
    }

    let isCurrent = true;

    getOwnerPromotionStats(ownerToken, promotionId)
      .then((data) => {
        if (isCurrent) {
          setStatsState({
            data,
            loading: false,
            error: null,
            hasToken: true,
          });
        }
      })
      .catch((error) => {
        if (isCurrent) {
          if (error.status === 401) {
            clearOwnerToken();
          }

          setStatsState({
            data: null,
            loading: false,
            error,
            hasToken: error.status !== 401,
          });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [promotionId]);

  const promotion = statsState.data?.promotion;
  const stats = statsState.data?.stats;
  const periodStart = formatSeoulDate(promotion?.starts_at);
  const periodEnd = formatSeoulDate(promotion?.ends_at);
  const period = periodStart && periodEnd ? `${periodStart} ~ ${periodEnd}` : "";
  const performanceStats = promotion && stats
    ? [
        {
          key: "views",
          label: "상세 페이지 조회수",
          value: formatCount(stats.views),
          icon: viewsIcon,
        },
        {
          key: "external-clicks",
          label: "외부 채널 클릭 수",
          value: formatCount(stats.channel_clicks),
          icon: externalClicksIcon,
          iconWidth: 18,
          iconHeight: 18,
        },
        {
          key: "coupon-issued",
          label: "쿠폰 발급 수",
          value: promotion.requires_coupon === false
            ? "해당 없음"
            : formatCount(stats.coupons_issued),
          icon: couponsIcon,
        },
        {
          key: "coupon-used",
          label: "쿠폰 사용 수",
          value: promotion.requires_coupon === false
            ? "해당 없음"
            : formatCount(stats.coupons_used),
          icon: couponsIcon,
        },
      ]
    : [];
  const statusMessage = !statsState.hasToken || statsState.error?.status === 401
    ? "점주 전용 링크를 다시 확인하거나 재발급해 주세요."
    : statsState.loading
      ? "프로모션 성과를 불러오는 중이에요."
      : statsState.error?.status === 404
        ? "프로모션 정보를 찾을 수 없습니다."
        : "프로모션 성과를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.";

  return (
    <main className="mx-auto min-h-dvh w-full max-w-[402px] bg-brand-surface">
      <Header
        title="프로모션 성과"
        onBack={() => navigate(-1)}
        className="h-[50px] bg-brand-surface"
        titleClassName="text-[20px] font-semibold leading-[140%] tracking-[-0.02px] text-fg"
      />

      <div className="px-6">
        {promotion && stats ? (
          <>
            <section aria-labelledby="promotion-name">
              <img
                src={promotion.image_url || promotionImage}
                alt={`${promotion.store?.name || ""} ${promotion.title || ""}`}
                className="aspect-square w-full object-cover"
              />
              <div className="mt-[15px] flex flex-col gap-0.5">
                <div className="flex items-center gap-[3px] text-body1 font-medium tracking-[-0.016px] text-fg-muted">
                  <span>{promotion.store?.name || ""}</span>
                  <img src={storeForwardIcon} alt="" width={12} height={22} />
                </div>
                <h1
                  id="promotion-name"
                  className="text-[20px] font-medium leading-[140%] tracking-[-0.02px] text-fg"
                >
                  {promotion.title || ""}
                </h1>
                <p className="text-body1 font-medium tracking-[-0.016px] text-fg-muted">
                  {period}
                </p>
                <p className="text-body1 font-semibold leading-[1.5] tracking-[-0.016px] text-brand-strong">
                  {getDday(promotion.ends_at)}
                </p>
              </div>
            </section>

            <section className="mt-[30px] grid grid-cols-2 gap-x-[14px] gap-y-[30px]" aria-label="프로모션 성과 지표">
              {performanceStats.map(({ key, ...stat }) => (
                <PerformanceStatCard key={key} {...stat} />
              ))}
            </section>
            <p className="mt-5 flex items-center justify-center gap-[3px] text-caption1 font-normal tracking-[-0.011px] whitespace-nowrap text-fg-muted">
              <img src={infoIcon} alt="" width={15} height={15} />
              외부 채널 클릭 수는 매장의 인스타그램·네이버 링크를 클릭한 횟수입니다.
            </p>
          </>
        ) : (
          <p className="pt-10 text-center text-body2 font-medium text-fg-muted" role="alert">
            {statusMessage}
          </p>
        )}
      </div>
    </main>
  );
}
