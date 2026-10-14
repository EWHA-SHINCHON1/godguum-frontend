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

function KakaoMark() {
  return (
    <span aria-hidden="true" className="relative size-5 shrink-0 rounded-full bg-black">
      <span className="absolute -bottom-0.5 left-0.5 size-2 rotate-45 bg-black" />
    </span>
  );
}

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
    <main className="relative mx-auto h-[874px] w-full max-w-[402px] overflow-hidden bg-[#fffdf7]">
      <section className="flex flex-col items-center pt-[204px] text-center">
        <img src={logo} alt="갓구움" width={128} height={68} className="h-auto w-32" />
        <p className="mt-5 w-[150px] text-center text-[16px] font-medium leading-[140%] tracking-[-0.016px] text-[#885300]">
          학교 앞 맛집과 혜택을 한 곳에서 만나보세요!
        </p>
      </section>

      <img
        src={loginCharacter}
        alt="갓구움 캐릭터"
        width={402}
        height={452}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-auto w-full"
      />

      <Button
        onClick={handleKakaoLogin}
        className="absolute left-[30px] top-[633px] h-[56px] w-[342px] gap-3 rounded-[99px] bg-[#FFDA5C] px-3 text-[16px] font-medium leading-[140%] tracking-[-0.016px] text-[#201F1A]"
      >
        <img
          src={kakaoIcon}
          alt=""
          aria-hidden="true"
          className="h-5 w-5 shrink-0"
        />
        카카오로 시작하기
      </Button>
      <p className="absolute left-0 top-[705px] w-full text-center text-body2 font-medium text-fg-muted">
        간단하게 시작해보세요!
      </p>
      {errorMessage && (
        <p
          role="alert"
          className="absolute left-0 top-[737px] w-full px-8 text-center text-body2 font-medium text-red-500"
        >
          {errorMessage}
        </p>
      )}
    </main>
  );
}

export default LoginPage;
