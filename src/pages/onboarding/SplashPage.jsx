import logo from "../../assets/icons/logo.svg";

/**
 * 온보딩 진입 시 표시되는 스플래시 화면.
 * 화면 전환은 라우터가 연결되는 시점에 상위 흐름에서 담당한다.
 */
function SplashPage() {
  return (
    <main
      className="flex min-h-dvh w-full items-center justify-center bg-brand"
      aria-label="갓구움 시작 화면"
    >
      <img
        src={logo}
        alt="갓구움"
        width={122}
        height={64}
        className="h-auto w-[122px] brightness-0 invert"
      />
    </main>
  );
}

export default SplashPage;
