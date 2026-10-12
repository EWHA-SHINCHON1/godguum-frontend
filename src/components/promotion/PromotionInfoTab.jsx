import promotionCharacter from "../../assets/icons/promotion/promotion-character.svg";
import periodIcon from "../../assets/icons/promotion/summary-period.svg";
import productIcon from "../../assets/icons/promotion/summary-product.svg";
import priceIcon from "../../assets/icons/promotion/summary-price.svg";
import conditionIcon from "../../assets/icons/promotion/summary-condition.svg";

/**
 * 프로모션 상세 > 프로모션 정보 탭
 * 소개 문구 · 음식 이미지 · 참여 방법 · 프로모션 한눈 요약
 */
export default function PromotionInfoTab({ promotion }) {
  const { info, dDay } = promotion;

  const summaryRows = [
    { icon: periodIcon, label: "프로모션 기간", value: info.summary.period, badge: dDay },
    { icon: productIcon, label: "대상 제품", value: info.summary.product },
    { icon: priceIcon, label: "특별가", value: info.summary.price },
    { icon: conditionIcon, label: "이용 조건", value: info.summary.condition },
  ];

  return (
    <div className="flex flex-col items-center gap-8 px-5 pt-[61px] pb-[87px]">
      <div className="flex flex-col items-center gap-10">
        <img src={promotionCharacter} alt="" width={126} height={111} />
        <div className="text-center text-fg">
          <h3 className="text-head1 font-semibold tracking-[-0.02px]">{info.headline}</h3>
          <div className="mt-7 flex flex-col gap-[19.6px]">
            {info.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="text-body2 font-medium tracking-[-0.014px] whitespace-pre-line"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>

      {info.image && (
        <img
          src={info.image}
          alt={`${promotion.storeName} 프로모션 제품`}
          width={300}
          height={150}
          className="h-[150px] w-[300px] object-cover"
        />
      )}

      <section
        aria-labelledby="participation-heading"
        className="flex w-full flex-col items-center gap-5 rounded-lg border-[0.5px] border-line bg-surface p-5 drop-shadow-[0_0_4px_rgba(0,0,0,0.04)]"
      >
        <h3
          id="participation-heading"
          className="flex w-[72px] items-center justify-center rounded-[20px] bg-brand px-2.5 py-[3px] text-body3 font-semibold tracking-[-0.012px] text-fg-inverse"
        >
          참여방법
        </h3>
        <ol className="flex flex-col items-center gap-[5px] text-center text-body3 font-medium tracking-[-0.012px] text-fg">
          {info.steps.map((step, index) => (
            <li key={step}>
              {index + 1}. {step}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="summary-heading" className="flex w-full flex-col gap-3">
        <h3
          id="summary-heading"
          className="text-body1 font-semibold leading-[1.5] tracking-[-0.016px] text-black"
        >
          프로모션 한눈 요약
        </h3>
        <dl className="flex flex-col rounded-lg border-[0.5px] border-line bg-surface px-3 py-1">
          {summaryRows.map((row) => (
            <div
              key={row.label}
              className="flex items-center gap-[72px] border-b-[0.5px] border-line py-2 last:border-b-0"
            >
              <dt className="flex w-[92px] shrink-0 items-center gap-2 text-body3 font-medium tracking-[-0.012px] whitespace-nowrap text-brand-contrast">
                <img src={row.icon} alt="" width={17} height={17} />
                {row.label}
              </dt>
              <dd className="flex min-w-0 items-center gap-2 text-body3 font-medium tracking-[-0.012px] text-fg">
                {row.value}
                {row.badge && <span className="font-semibold text-brand-strong">{row.badge}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
