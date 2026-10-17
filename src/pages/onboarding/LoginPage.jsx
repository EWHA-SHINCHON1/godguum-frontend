import { Button } from "../../components/common";
import { useSearchParams } from "react-router-dom";
import logo from "../../assets/icons/logo.svg";
import loginCharacter from "../../assets/icons/login-character.svg";
import kakaoIcon from "../../assets/icons/kakao.svg";
import { startKakaoLogin } from "../../api/auth";

const loginErrorMessages = {
  LOGIN_CANCELLED: "로그인이 취소되었습니다.",
  INVALID_STATE: "로그인 시간이 만료되었습니다. 다시 시도해 주세요.",
  INVALID_REQUEST: "다시 로그인해 주세요.",
  KAKAO_AUTH_FAILED: "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
  KAKAO_NOT_CONFIGURED: "로그인을 사용할 수 없습니다. 운영팀에 문의해 주세요.",
  INACTIVE_USER: "이용이 제한된 계정입니다.",
};

function LoginPage() {
  const [searchParams] = useSearchParams();
  const errorCode = searchParams.get("error");
  const errorMessage = searchParams.has("error")
    ? loginErrorMessages[errorCode] || "로그인에 실패했습니다. 다시 시도해 주세요."
    : null;

  const handleKakaoLogin = () => {
    startKakaoLogin("/");
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col overflow-x-hidden bg-[#fffdf7]">
      <section className="flex shrink-0 flex-col items-center pt-[clamp(96px,23.3dvh,204px)] text-center">
        <img src={logo} alt="갓구움" width={128} height={68} className="h-auto w-32" />
        <p className="mt-5 w-[150px] text-center text-[16px] font-medium leading-[140%] tracking-[-0.016px] text-[#885300]">
          학교 앞 맛집과 혜택을 한 곳에서 만나보세요!
        </p>
      </section>

      <div className="mt-[clamp(20px,calc(31.9dvh-193px),86px)] flex-none">
        <img
          src={loginCharacter}
          alt="갓구움 캐릭터"
          width={402}
          height={452}
          className="pointer-events-none h-auto w-full object-contain"
        />
      </div>

      <section className="relative z-10 -mt-[241px] flex flex-none flex-col items-center px-[30px] pb-8">
        <Button
          onClick={handleKakaoLogin}
          className="h-[56px] w-full gap-3 rounded-[99px] bg-[#FFDA5C] px-3 text-[16px] font-medium leading-[140%] tracking-[-0.016px] text-[#201F1A]"
        >
          <img
            src={kakaoIcon}
            alt=""
            aria-hidden="true"
            className="h-5 w-5 shrink-0"
          />
          카카오로 시작하기
        </Button>
        <p className="mt-4 text-center text-body2 font-medium text-fg-muted">
          간단하게 시작해보세요!
        </p>
        {errorMessage && (
          <p
            role="alert"
            className="mt-2 text-center text-body2 font-medium text-red-500"
          >
            {errorMessage}
          </p>
        )}
      </section>
    </main>
  );
}

export default LoginPage;
