import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/icons/logo.svg";
import { getMe } from "../../api/auth";

/**
 * 온보딩 진입 시 표시되는 스플래시 화면.
 * 일정 시간 후 홈 화면으로 이동한다.
 */
function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    let timer;
    const minimumDisplayTime = new Promise((resolve) => {
      timer = setTimeout(resolve, 1500);
    });

    Promise.all([getMe().catch(() => null), minimumDisplayTime]).then(() => {
      if (isMounted) {
        navigate("/home", { replace: true });
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [navigate]);

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
