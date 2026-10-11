import bannerImage from "../../assets/images/home/figma-raw-2.png";
import chevronRight from "../../assets/icons/chevron-right.svg";

export default function MainPromotionBanner() {
  return (
    <section className="relative h-[180px] overflow-hidden" aria-label="대표 프로모션">
      <img
        src={bannerImage}
        alt="갓 구운 마들렌"
        className="absolute left-[-6.3px] top-[-8.5px] h-[188.482px] w-[428.163px] max-w-none"
      />
      <div className="absolute inset-y-0 left-0 w-[62%] bg-gradient-to-r from-[#fff4df] via-[#fff4df]/90 to-transparent" />
      <div className="relative z-10 flex h-full flex-col items-start px-[17px] pt-[17px]">
        <h1
          className="font-['Nanum_Pen_Script',cursive] text-[28px] font-normal leading-[120%] tracking-[-0.028px] text-[#874F0F]"
          style={{
            WebkitTextStrokeWidth: "0.3px",
            WebkitTextStrokeColor: "#874F0F",
          }}
        >
          수업 끝나고
          <br />
          달달하게
        </h1>
        <p className="mt-2 text-body3 font-medium tracking-[-0.012px] text-black">
          카페 올베르
        </p>
        <button
          type="button"
          className="mt-[14px] inline-flex items-center gap-1 rounded-full bg-brand-contrast px-3 py-1 text-body3 font-medium tracking-[-0.012px] text-fg-inverse"
        >
          지금 쿠폰 받기
          <img
            src={chevronRight}
            alt=""
            aria-hidden="true"
            className="h-[11px] w-[6px] shrink-0"
          />
        </button>
      </div>
    </section>
  );
}
