import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/icons/logo.svg";
import { Tag } from "../../components/common";
import OwnerPromotionCard from "../../components/owner/OwnerPromotionCard";
import {
  clearOwnerToken,
  getOwnerDashboard,
  getStoredOwnerToken,
  storeOwnerTokenFromHash,
} from "../../api/owner";

const FILTERS = ["전체", "진행중", "진행 종료"];

const seoulDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function getSeoulDateParts(date) {
  const parts = seoulDateFormatter.formatToParts(date);

  return Object.fromEntries(
    parts
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

function toOwnerPromotion(promotion, storeName) {
  const startsAt = formatSeoulDate(promotion.starts_at);
  const endsAt = formatSeoulDate(promotion.ends_at);

  return {
    id: promotion.id,
    storeName,
    name: promotion.title || "",
    image: promotion.image_url || undefined,
    period: startsAt && endsAt ? `${startsAt} ~ ${endsAt}` : "",
    dDay: getDday(promotion.ends_at),
    status: promotion.status,
    periodStatus: promotion.period_status,
  };
}

function getInitialDashboardState() {
  storeOwnerTokenFromHash();
  const hasToken = Boolean(getStoredOwnerToken());

  return {
    dashboard: null,
    loading: hasToken,
    error: null,
    hasToken,
  };
}

export default function OwnerPromotionPage({ ownerName = "무시무시" }) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("전체");
  const [dashboardState, setDashboardState] = useState(getInitialDashboardState);

  useEffect(() => {
    const ownerToken = getStoredOwnerToken();

    if (!ownerToken) {
      return undefined;
    }

    let isCurrent = true;

    getOwnerDashboard(ownerToken)
      .then((dashboard) => {
        if (isCurrent) {
          setDashboardState({
            dashboard,
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

          setDashboardState({
            dashboard: null,
            loading: false,
            error,
            hasToken: error.status !== 401,
          });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const promotions = useMemo(
    () =>
      (dashboardState.dashboard?.promotions || []).map((promotion) =>
        toOwnerPromotion(promotion, dashboardState.dashboard?.store?.name || ownerName),
      ),
    [dashboardState.dashboard, ownerName],
  );
  const displayedPromotions = useMemo(
    () =>
      promotions.filter((promotion) => {
        if (activeFilter === "진행중") {
          return promotion.periodStatus === "ongoing";
        }

        if (activeFilter === "진행 종료") {
          return promotion.periodStatus === "ended";
        }

        return true;
      }),
    [activeFilter, promotions],
  );
  const displayOwnerName = dashboardState.dashboard?.store?.name || ownerName;
  const emptyMessage = !dashboardState.hasToken || dashboardState.error?.status === 401
    ? "점주 전용 링크를 다시 확인하거나 재발급해 주세요."
    : dashboardState.loading
      ? "프로모션을 불러오는 중이에요."
      : dashboardState.error
        ? "프로모션을 불러오지 못했어요. 잠시 후 다시 시도해 주세요."
        : "선택 조건에 맞는\n프로모션이 없어요";

  return (
    <main className="relative mx-auto min-h-dvh w-full max-w-[402px] bg-brand-surface">
      <header className="flex items-start px-6 pt-[9px]">
        <img
          src={logo}
          alt="갓구움"
          width={100}
          height={52.814}
          className="h-auto w-[100px]"
        />
      </header>

      <div className="px-6 pt-4">
        <div className="text-black">
          <p className="text-[20px] font-semibold leading-[150%] tracking-[-0.02px]">
            안녕하세요, {displayOwnerName} 점주님
          </p>

          <p className="text-[20px] font-semibold leading-[140%] tracking-[-0.02px]">
            오늘의 프로모션 성과를 확인해보세요.
          </p>
        </div>

        <div className="mt-[30px] flex gap-1">
          {FILTERS.map((filter) => {
            const isSelected = filter === activeFilter;
            return (
              <Tag
                key={filter}
                selected={isSelected}
                onClick={() => setActiveFilter(filter)}
                className={isSelected
                  ? "rounded-[15px] bg-[#f8d185] px-[15px] py-[5px] text-black"
                  : "rounded-[15px] bg-[#fef9f0] px-[15px] py-[5px] text-black"}
              >
                {filter}
              </Tag>
            );
          })}
        </div>

        {displayedPromotions.length > 0 ? (
          <div className="mt-[14px] -mx-[5px] flex flex-col gap-3">
            {displayedPromotions.map((promotion) => (
              <OwnerPromotionCard
                key={promotion.id}
                promotion={promotion}
                onClick={() => navigate(`/owner/promotions/${promotion.id}/performance`)}
              />
            ))}
          </div>
        ) : (
          <div className="absolute left-1/2 top-[417px] -translate-x-1/2">
            <p className="w-[143px] text-center text-[20px] font-semibold leading-[140%] tracking-[-0.02px] text-black">
              {emptyMessage.split("\n").map((line, index) => (
                <span key={line}>
                  {index > 0 && <br />}
                  {line}
                </span>
              ))}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
