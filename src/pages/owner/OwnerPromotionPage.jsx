import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/icons/logo.svg";
import { Tag } from "../../components/common";
import OwnerPromotionCard from "../../components/owner/OwnerPromotionCard";

const FILTERS = ["전체", "진행중", "진행 종료"];

const PROMOTIONS = [
  {
    id: "seongmu-discovery-1",
    storeName: "성무",
    name: "성무 취향 발견 주간",
    period: "26.11.06 ~ 26.11.08",
    dDay: "D-3",
    status: "진행중",
  },
  {
    id: "seongmu-discovery-2",
    storeName: "성무",
    name: "성무 취향 발견 주간",
    period: "26.11.06 ~ 26.11.08",
    dDay: "D-3",
    status: "진행중",
  },
];

export default function OwnerPromotionPage({ ownerName = "무시무시" }) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("전체");
  const displayedPromotions = useMemo(
    () => PROMOTIONS.filter((promotion) => activeFilter === "전체" || promotion.status === activeFilter),
    [activeFilter],
  );

  return (
    <main className="relative mx-auto min-h-dvh max-w-[402px] bg-brand-surface">
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
            안녕하세요, {ownerName} 점주님
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
              선택 조건에 맞는
              <br />
              프로모션이 없어요
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
