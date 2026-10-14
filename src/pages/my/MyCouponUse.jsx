import { useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import couponUseCharacter from "../../assets/icons/my/coupon-use-character.svg";
import { Header, cn } from "../../components/common";
import { getCoupon } from "../../mocks/coupons";

const CODE_LENGTH = 4;

/**
 * 4-3-3 쿠폰 사용하기 — 매장 직원이 4자리 확인코드를 입력한다.
 * 화면 하단 숫자 키패드(Figma)는 실제 기기의 숫자 키보드로 대체한다 (inputMode="numeric").
 */
export default function MyCouponUse() {
  const navigate = useNavigate();
  const { couponId } = useParams(); // URL의 :couponId (예: "101") 가져옴
  const coupon = getCoupon(couponId);
  const inputRef = useRef(null);
  const [code, setCode] = useState("");
  const [focused, setFocused] = useState(false);

  if (!coupon || coupon.status !== "available") {
    return <Navigate to="/my/coupons" replace />;
  }

  const handleChange = (e) => {
    const next = e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(next);
    if (next.length === CODE_LENGTH) {
      // TODO: API 연동 시 확인코드 검증 후 쿠폰 사용 처리 (실패하면 에러 안내 + 입력 초기화)
      inputRef.current?.blur();
      navigate("/my/coupons?tab=used", { replace: true });
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-[402px] flex-col bg-brand-surface">
      <Header
        title="쿠폰 사용하기"
        onBack={() => navigate(-1)}
        className="bg-brand-surface"
      />

      <section className="flex flex-1 flex-col items-center gap-8 bg-brand-weak px-5 pt-[clamp(66px,20dvh,176px)]">
        <div className="flex flex-col items-center gap-4">
          <img src={couponUseCharacter} alt="" width={150} height={150} />
          <h2 className="text-center text-head1 font-semibold tracking-[-0.02px] text-fg">
            매장 직원이
            <br />
            확인코드를 누르게 해주세요
          </h2>
        </div>

        {/* 보이는 칸 4개 + 그 위에 투명한 실제 입력창 하나 */}
        <label className="relative flex items-center gap-2">
          <span className="sr-only">확인코드 {CODE_LENGTH}자리</span>
          {Array.from({ length: CODE_LENGTH }, (_, index) => {
            const active =
              focused && index === Math.min(code.length, CODE_LENGTH - 1);
            return (
              <span
                key={index}
                aria-hidden="true"
                className={cn(
                  "flex h-[52px] w-12 items-center justify-center rounded-md border bg-surface p-2.5",
                  "text-head1 font-semibold text-fg transition-colors",
                  active ? "border-brand" : "border-line",
                )}
              >
                {code[index] ?? ""}
              </span>
            );
          })}
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={CODE_LENGTH}
            value={code}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoFocus
            className="absolute inset-0 h-full w-full cursor-text opacity-0"
          />
        </label>
      </section>
    </main>
  );
}
