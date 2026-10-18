import hoursIcon from "../../assets/icons/promotion/summary-period.svg";
import linkIcon from "../../assets/icons/store/info-link.svg";
import locationIcon from "../../assets/icons/store/info-location.svg";

function InfoRow({ icon, label, children }) {
  return (
    <div className="flex w-full items-start gap-5">
      <dt className="flex w-[75px] shrink-0 items-center gap-2 py-[3px]">
        <img
          src={icon}
          alt=""
          width={17}
          height={17}
          className="size-[17px] shrink-0"
        />
        <span className="text-body3 font-semibold whitespace-nowrap text-brand-contrast">
          {label}
        </span>
      </dt>
      <dd className="min-w-0 flex-1 text-body3 font-medium break-keep whitespace-pre-line text-fg">
        {children}
      </dd>
    </div>
  );
}

/**
 * 매장 정보 카드 (Figma: 매장 정보)
 * 영업시간 · 위치 · 외부 링크
 * onLinkClick(link): 외부 링크를 눌렀을 때 호출 (채널 클릭 이벤트 전송용, 선택)
 */
export default function StoreInfoCard({ store, onLinkClick }) {
  return (
    <section
      aria-label="매장 정보"
      className="w-full rounded-lg border-[0.5px] border-line bg-surface p-5"
    >
      <dl className="flex flex-col gap-2.5">
        <InfoRow icon={hoursIcon} label="영업시간">
          {store.hours}
        </InfoRow>
        <InfoRow icon={locationIcon} label="위치">
          {store.location}
        </InfoRow>
        {store.links?.length > 0 && (
          <InfoRow icon={linkIcon} label="외부 링크">
            <span className="flex flex-col gap-0.5">
              {store.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  // preventDefault 를 하지 않으므로 이벤트 전송과 상관없이 링크는 그대로 열림
                  onClick={() => onLinkClick?.(link)}
                  className="w-fit text-fg-info underline decoration-from-font underline-offset-2"
                >
                  {link.label}
                </a>
              ))}
            </span>
          </InfoRow>
        )}
      </dl>
    </section>
  );
}
