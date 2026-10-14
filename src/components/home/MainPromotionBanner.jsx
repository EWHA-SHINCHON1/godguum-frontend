import bannerImage from "../../assets/images/home/figma-raw-2.png";
import chevronRight from "../../assets/icons/chevron-right.svg";

// [변경] props 추가: promotion(배너에 연결할 mock 프로모션), onClick(배너 클릭 시 상세 이동)
export default function MainPromotionBanner({ promotion, onClick }) {
  return (
    <section
      onClick={onClick} // [변경] 추가: 배너 전체 클릭(“지금 쿠폰 받기” 버튼 포함) 시 상세 이동
      className={`relative h-[180px] overflow-hidden${onClick ? " cursor-pointer" : ""}`} // [변경] 클릭 가능할 때 포인터 커서
      aria-label="대표 프로모션"
    >
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
          {/* [변경] 하드코딩된 "카페 올베르" → mock 데이터의 storeName 사용 (없으면 기존 문구) */}
          {promotion?.storeName ?? "카페 올베르"}
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
