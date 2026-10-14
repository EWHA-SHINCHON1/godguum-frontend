import { Button } from "../../components/common";
import logo from "../../assets/icons/logo.svg";
import loginCharacter from "../../assets/icons/login-character.svg";
import kakaoIcon from "../../assets/icons/kakao.svg";

function KakaoMark() {
  return (
    <span aria-hidden="true" className="relative size-5 shrink-0 rounded-full bg-black">
      <span className="absolute -bottom-0.5 left-0.5 size-2 rotate-45 bg-black" />
    </span>
  );
}

/** 로그인 시작 화면. 카카오 인증 연결은 상위 인증 흐름에서 담당한다. */
function LoginPage() {
  const handleKakaoLogin = () => {
    // TODO: 카카오 OAuth 연결 시 인증 시작 로직을 추가한다.
  };

  return (
    <main className="relative mx-auto min-h-dvh w-full max-w-[402px] overflow-hidden bg-[#fffdf7]">
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
    </main>
  );
}

export default LoginPage;
