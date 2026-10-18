import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import couponUseCharacter from "../../assets/icons/my/coupon-use-character.svg";
import { Header, cn } from "../../components/common";
import { getMe } from "../../api/auth";
import { getMyCoupon, redeemCoupon } from "../../api/coupon";

const CODE_LENGTH = 4;

/**
 * 4-3-3 쿠폰 사용하기 — 매장 직원이 4자리 확인코드(매장 PIN)를 입력한다. (명세서 ⑤-8~10)
 * 화면 하단 숫자 키패드(Figma)는 실제 기기의 숫자 키보드로 대체한다 (inputMode="numeric").
 *
 * 흐름
 *   1) 화면에 들어오면 GET /me/coupons/{id}/ 로 쿠폰 상태 확인
 *   2) 4자리를 다 입력하면 POST /me/coupons/{id}/use/ { pin: "0428" }
 *   3) 성공 → 내 쿠폰 "사용 완료" 탭으로
 *      실패 → 입력 칸 아래에 빨간 작은 글씨로 이유 안내 + 입력 초기화
 *
 * PIN 은 화면 state 에만 잠깐 있고, 저장하거나 console 에 찍지 않음
 */
export default function MyCouponUse() {
  const navigate = useNavigate();
  const { couponId } = useParams(); // URL의 :couponId (쿠폰 UUID)
  const inputRef = useRef(null);
  const [code, setCode] = useState("");
  const [focused, setFocused] = useState(false);

  // 쿠폰 불러오기 상태: "loading" | "ready" | "notFound" | "error"
  const [pageStatus, setPageStatus] = useState("loading");
  const [retryKey, setRetryKey] = useState(0);

  // 입력 칸 아래 빨간 문구 (없으면 "")
  const [errorMessage, setErrorMessage] = useState("");

  // 더 이상 사용할 수 없는 쿠폰이면 "used" | "expired" → 입력 막고 쿠폰함 버튼 표시
  const [blockedStatus, setBlockedStatus] = useState(null);

  // PIN 잠금이 풀리는 시각 (Date.now() 기준 ms). null 이면 잠금 아님
  const [lockedUntil, setLockedUntil] = useState(null);

  // 요청 중 (state 는 화면 표시용, ref 는 아주 빠른 중복 제출 방지용)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const inputDisabled =
    pageStatus !== "ready" ||
    isSubmitting ||
    lockedUntil !== null ||
    blockedStatus !== null;

  // 사용할 수 없는 상태를 화면에 반영 (이미 사용 / 기간 만료)
  const showBlocked = (status) => {
    setBlockedStatus(status);
    setErrorMessage(
      status === "used"
        ? "이미 사용한 쿠폰이에요."
        : "사용 기한이 지난 쿠폰이에요.",
    );
  };

  // 1) 쿠폰 상태 확인
  useEffect(() => {
    let isCurrent = true;
    setPageStatus("loading");

    getMyCoupon(couponId)
      .then((coupon) => {
        if (!isCurrent) return;
        if (coupon.status !== "available") {
          showBlocked(coupon.status);
        }
        setPageStatus("ready");
      })
      .catch((error) => {
        if (!isCurrent) return;
        if (error.status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        // 404 COUPON_NOT_FOUND: 없는 쿠폰·다른 사람 쿠폰
        setPageStatus(error.status === 404 ? "notFound" : "error");
      });

    return () => {
      isCurrent = false;
    };
  }, [couponId, retryKey, navigate]);

  // 잠금 시간이 지나면 다시 입력할 수 있게 (실제로 풀렸는지는 다음 요청의 서버 응답으로 확인)
  useEffect(() => {
    if (lockedUntil === null) return;

    const timer = setTimeout(
      () => {
        setLockedUntil(null);
        setErrorMessage("");
      },
      Math.max(0, lockedUntil - Date.now()),
    );

    return () => clearTimeout(timer);
  }, [lockedUntil]);

  // 입력할 수 있는 상태가 되면 입력 칸에 커서 (처음 들어왔을 때, 틀려서 다시 입력할 때)
  useEffect(() => {
    if (!inputDisabled) inputRef.current?.focus();
  }, [inputDisabled]);

  // 응답을 못 받았을 때: 다시 보내지 않고 쿠폰 상태부터 확인 (명세서 ⑤-10)
  // 서버에선 이미 사용 처리됐을 수도 있기 때문
  const checkStatusAfterUnknownResult = async () => {
    try {
      const coupon = await getMyCoupon(couponId);

      if (coupon.status === "used") {
        navigate("/my/coupons?tab=used", { replace: true }); // 사실 성공했던 것
      } else if (coupon.status === "expired") {
        showBlocked("expired");
      } else {
        setErrorMessage("사용 처리가 확인되지 않았어요. 다시 입력해 주세요.");
      }
    } catch {
      setErrorMessage(
        "쿠폰 상태를 확인하지 못했어요. 연결을 확인하고 다시 입력해 주세요.",
      );
    }
  };

  // 사용 실패 처리 — 오류마다 다른 문구 (모두 "PIN 틀림"으로 뭉뚱그리지 않기)
  const handleRedeemError = async (error) => {
    // PIN 이 아닌 상태·코드만 기록
    console.warn("[coupon] 쿠폰 사용 실패", error.status, error.code);

    if (error.status === 401) {
      navigate("/login", { replace: true });
      return;
    }

    switch (error.code) {
      case "INVALID_PIN": {
        const remaining = error.details?.remaining_attempts;
        setErrorMessage(
          typeof remaining === "number"
            ? `확인코드가 올바르지 않아요. (남은 시도 ${remaining}회)`
            : "확인코드가 올바르지 않아요.",
        );
        return;
      }
      case "INVALID_PIN_FORMAT":
        setErrorMessage("확인코드는 숫자 4자리로 입력해 주세요.");
        return;
      case "PIN_LOCKED": {
        // 기다릴 시간은 서버 값 기준 (없으면 Retry-After 헤더, 그것도 없으면 10분)
        const seconds =
          Number(error.details?.retry_after_seconds) ||
          Number(error.retryAfter) ||
          600;
        setLockedUntil(Date.now() + seconds * 1000);
        setErrorMessage(
          `여러 번 잘못 입력했어요. ${Math.ceil(seconds / 60)}분 후 다시 시도해 주세요.`,
        );
        return;
      }
      case "PIN_NOT_SET":
        setErrorMessage(
          "매장 확인코드가 아직 설정되지 않았어요. 매장에 문의해 주세요.",
        );
        return;
      case "COUPON_ALREADY_USED":
        showBlocked("used");
        return;
      case "COUPON_EXPIRED":
        showBlocked("expired");
        return;
      case "COUPON_NOT_FOUND":
        setPageStatus("notFound");
        return;
      default:
        // 네트워크 끊김·서버 오류 등 결과를 알 수 없는 경우
        await checkStatusAfterUnknownResult();
    }
  };

  // 2) 4자리가 다 입력되면 사용 요청
  const submit = async (pin) => {
    if (isSubmittingRef.current) return;

    // 보내기 전에 형식 확인: 정확히 숫자 4자리 (문자열 그대로 보냄)
    if (!/^[0-9]{4}$/.test(pin)) {
      setErrorMessage("확인코드는 숫자 4자리로 입력해 주세요.");
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      try {
        await redeemCoupon(couponId, pin);
      } catch (error) {
        // 403 CSRF_FAILED 는 서버가 처리 전에 거절한 것 → 토큰 새로 받고 한 번만 다시 (안전)
        if (error.status !== 403) throw error;
        await getMe();
        await redeemCoupon(couponId, pin);
      }

      // 성공 → 사용 완료 탭으로 (그 화면이 목록을 새로 불러오므로 숫자도 최신으로 보임)
      navigate("/my/coupons?tab=used", { replace: true });
    } catch (error) {
      await handleRedeemError(error);
    } finally {
      setCode(""); // 성공·실패 상관없이 입력한 PIN 지우기
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const next = e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(next);

    // 다시 입력하기 시작하면 이전 오류 문구는 지움 (잠금·사용 불가 문구는 유지)
    if (next.length > 0 && lockedUntil === null && blockedStatus === null) {
      setErrorMessage("");
    }

    if (next.length === CODE_LENGTH) {
      inputRef.current?.blur();
      submit(next);
    }
  };

  // ───────── 쿠폰을 못 불러온 경우 ─────────
  if (pageStatus === "notFound" || pageStatus === "error") {
    const isNotFound = pageStatus === "notFound";
    return (
      <main className="mx-auto flex min-h-dvh max-w-[402px] flex-col bg-brand-surface">
        <Header
          title="쿠폰 사용하기"
          onBack={() => navigate(-1)}
          className="bg-brand-surface"
        />
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <p className="text-body2 font-medium text-fg-muted">
            {isNotFound ? "쿠폰을 찾을 수 없어요" : "쿠폰을 불러오지 못했어요"}
          </p>
          <button
            type="button"
            onClick={() =>
              isNotFound
                ? navigate("/my/coupons", { replace: true })
                : setRetryKey((key) => key + 1)
            }
            className="rounded-full bg-brand-weak px-4 py-2 text-body3 font-semibold text-brand-strong"
          >
            {isNotFound ? "내 쿠폰으로 돌아가기" : "다시 시도"}
          </button>
        </div>
      </main>
    );
  }

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

        <div className="flex flex-col items-center gap-3">
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
                    inputDisabled && "opacity-60",
                  )}
                >
                  {/* 입력한 숫자 대신 ● 표시 (PIN 이 화면에 그대로 보이지 않게) */}
                  {code[index] ? "●" : ""}
                </span>
              );
            })}
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              autoComplete="off"
              pattern="[0-9]*"
              maxLength={CODE_LENGTH}
              value={code}
              onChange={handleChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              disabled={inputDisabled}
              aria-invalid={errorMessage ? true : undefined}
              aria-describedby={errorMessage ? "coupon-pin-error" : undefined}
              className="absolute inset-0 h-full w-full cursor-text opacity-0 disabled:cursor-default"
            />
          </label>

          {/* 상태 안내: 요청 중이면 회색, 오류면 빨간 작은 글씨 */}
          {isSubmitting ? (
            <p className="text-body3 font-medium text-fg-muted">
              확인하는 중이에요...
            </p>
          ) : (
            errorMessage && (
              <p
                id="coupon-pin-error"
                role="alert"
                className="text-center text-body3 font-medium break-keep text-red-500"
              >
                {errorMessage}
              </p>
            )
          )}

          {/* 이미 사용·만료된 쿠폰이면 쿠폰함으로 돌아가는 버튼 */}
          {blockedStatus && (
            <button
              type="button"
              onClick={() =>
                navigate(`/my/coupons?tab=${blockedStatus}`, { replace: true })
              }
              className="rounded-full bg-surface px-4 py-2 text-body3 font-semibold text-brand-strong"
            >
              내 쿠폰으로 돌아가기
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
