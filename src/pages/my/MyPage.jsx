import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import profileAvatar from "../../assets/icons/my/profile-avatar.svg";
import bannerCharacter from "../../assets/icons/my/banner-character.svg";
import bannerHeart from "../../assets/icons/my/banner-heart.svg";
import historyIcon from "../../assets/icons/my/menu-history.svg";
import couponIcon from "../../assets/icons/my/menu-coupon.svg";
import savedIcon from "../../assets/icons/my/menu-saved.svg";
import chevronIcon from "../../assets/icons/my/menu-chevron.svg";
import characterSad from "../../assets/icons/character-sad.svg";
import { ConfirmModal, GNB, TopBar } from "../../components/common";
import { getMe, logout } from "../../api/auth";
import { getMyCoupons } from "../../api/coupon";
import { getSavedPromotions } from "../../api/promotions";
import { useSavedPromotions } from "../../store/savedPromotions";

// 프로필 아래 인사말 (서버에 없는 값이라 고정 문구)
const GREETING = "오늘도 맛있는 하루!";

// 숫자를 아직 모를 때(불러오는 중·실패) 0 대신 보여줄 표시
// 명세서 ⑥-8: "조회 실패했을 때 임의로 0을 표시하지 않음"
const UNKNOWN_COUNT = "-";

const MENUS = [
  {
    key: "history",
    icon: historyIcon,
    title: "이용내역",
    description: "발급한 쿠폰과 사용한 내역을 확인해보세요.",
    path: "/my/history",
  },
  {
    key: "coupon",
    icon: couponIcon,
    title: "내 쿠폰",
    description: "발급한 쿠폰과 사용한 내역을 확인해보세요.",
    path: "/my/coupons",
  },
  {
    key: "saved",
    icon: savedIcon,
    title: "저장",
    description: "저장한 프로모션을 모아봤어요.",
    path: "/saved",
  },
];

/**
 * 4-1-1 마이 (명세서 ⑥-7·8, ②로그아웃)
 * 마이페이지 전용 API 는 없어서 여러 API 를 조합함
 *
 *   닉네임            GET /auth/me/                     → nickname
 *   전체 쿠폰         GET /me/coupons/                  → count
 *   사용한 쿠폰       GET /me/coupons/?status=used      → count
 *   저장한 프로모션   GET /me/saved-promotions/         → count
 *   로그아웃          POST /auth/logout/
 *
 * 순서: /auth/me/ 로 로그인 확인 → 로그인 했을 때만 개인 API 3개를 "동시에" 호출
 */
export default function MyPage() {
  const navigate = useNavigate();
  const { resetSaved } = useSavedPromotions();
  const [logoutOpen, setLogoutOpen] = useState(false);

  // 프로필 조회 상태: "loading" | "ready" | "error"
  const [profileStatus, setProfileStatus] = useState("loading");
  const [nickname, setNickname] = useState("");

  // 숫자 3개. null = 아직 모름(불러오는 중 또는 실패) → 화면에는 "-"
  const [counts, setCounts] = useState({
    total: null,
    used: null,
    saved: null,
  });

  // 바뀌면 처음부터 다시 조회 ("다시 시도" 버튼용)
  const [retryKey, setRetryKey] = useState(0);

  // 로그아웃 요청 중인지 (확인 버튼 연타 방지. 화면에 그릴 값이 아니라 useRef)
  const isLoggingOutRef = useRef(false);

  useEffect(() => {
    let isCurrent = true;

    async function loadMyPage() {
      setProfileStatus("loading");
      setCounts({ total: null, used: null, saved: null });

      // 1) 로그인 확인 + 닉네임
      let me;
      try {
        me = await getMe();
      } catch (error) {
        // 네트워크·서버 오류 → 로그인 안 된 걸로 착각하지 않고 "실패"로 표시
        console.warn("[my] 로그인 상태 확인 실패", error);
        if (isCurrent) setProfileStatus("error");
        return;
      }

      if (!isCurrent) return;

      if (!me.is_authenticated) {
        // 비로그인 → 개인 API 는 부르지 않고 로그인 화면으로
        navigate("/login", { replace: true });
        return;
      }

      // 닉네임이 빈 문자열일 수 있음 → "사용자"로 대체 (명세서 ⑥-7)
      setNickname(me.nickname || "사용자");
      setProfileStatus("ready");

      // 2) 숫자 3개를 동시에 조회
      //    Promise.allSettled: 하나가 실패해도 나머지 결과는 받아옴
      //    (Promise.all 은 하나만 실패해도 전부 실패 처리라서 안 씀)
      const [total, used, saved] = await Promise.allSettled([
        getMyCoupons(),
        getMyCoupons({ status: "used" }),
        getSavedPromotions(),
      ]);

      if (!isCurrent) return;

      // 그 사이 세션이 끊겼으면(401) 로그인 화면으로
      const results = [total, used, saved];
      if (
        results.some((r) => r.status === "rejected" && r.reason?.status === 401)
      ) {
        navigate("/login", { replace: true });
        return;
      }

      // 성공한 것만 count, 실패한 것은 null("-")
      // results.length 가 아니라 count 를 써야 전체 개수 (results 는 한 페이지 20개까지만)
      const pickCount = (result) =>
        result.status === "fulfilled" ? (result.value?.count ?? null) : null;

      results
        .filter((r) => r.status === "rejected")
        .forEach((r) => console.warn("[my] 숫자 조회 실패", r.reason));

      setCounts({
        total: pickCount(total),
        used: pickCount(used),
        saved: pickCount(saved),
      });
    }

    loadMyPage();

    return () => {
      isCurrent = false;
    };
  }, [navigate, retryKey]);

  const showCount = (value) => (value === null ? UNKNOWN_COUNT : value);

  // "전체 쿠폰" = 사용 완료·기간 만료까지 포함한 전체 (명세서 ⑥-8)
  // 만약 기획이 "지금 쓸 수 있는 쿠폰"이면 getMyCoupons({ status: "available" }) 로 바꾸고 라벨도 바꿀 것
  const stats = [
    { label: "전체 쿠폰", value: showCount(counts.total) },
    { label: "사용한 쿠폰", value: showCount(counts.used) },
    { label: "저장한 프로모션", value: showCount(counts.saved) },
  ];

  // 프로필 이름 자리에 보여줄 글자
  const displayName = profileStatus === "ready" ? `${nickname}님` : "";

  const handleLogout = async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    try {
      try {
        await logout();
      } catch (error) {
        // 403 CSRF_FAILED: 토큰이 없거나 오래된 경우
        // → /auth/me/ 로 새 토큰을 받고 한 번만 다시 시도 (명세서 ⑥-11)
        if (error.status !== 403) throw error;
        await getMe();
        await logout();
      }

      // 로그아웃 성공 → 이전 사용자의 개인 데이터 비우기
      resetSaved(); // 이번 방문 중 눌렀던 북마크 기록
      setLogoutOpen(false);
      navigate("/login", { replace: true });
    } catch (error) {
      console.warn("[my] 로그아웃 실패", error.status, error.code, error);
      setLogoutOpen(false);
      alert("로그아웃하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      isLoggingOutRef.current = false;
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-[402px] flex-col bg-brand-surface pb-28">
      <TopBar
        onLogoClick={() => navigate("/home")}
        onBookmarkClick={() => navigate("/saved")}
      />

      <div className="flex flex-col gap-4 px-5 pt-3">
        {/* 프로필 카드 */}
        <section className="flex flex-col items-center rounded-lg border-[0.5px] border-line bg-surface px-3">
          <div className="flex w-full items-center justify-between border-b-[0.5px] border-line py-3">
            <div className="flex items-center gap-3">
              <img src={profileAvatar} alt="" width={57} height={56} />
              <div className="flex flex-col gap-1">
                {/* 이름 줄: 불러오는 중이면 빈칸(높이 유지), 실패면 안내 */}
                <p className="min-h-[1.5em] text-head2 font-semibold tracking-[-0.018px] text-fg">
                  {profileStatus === "error"
                    ? "정보를 불러오지 못했어요"
                    : displayName}
                </p>
                {profileStatus === "error" ? (
                  <button
                    type="button"
                    onClick={() => setRetryKey((key) => key + 1)}
                    className="self-start text-body3 font-semibold tracking-[-0.012px] text-brand-strong underline"
                  >
                    다시 시도
                  </button>
                ) : (
                  <p className="text-body3 font-medium tracking-[-0.012px] text-fg-muted">
                    {GREETING}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              className="rounded-full bg-brand-weak px-3 py-1.5 text-body3 font-semibold tracking-[-0.012px] whitespace-nowrap text-brand-strong"
            >
              로그아웃
            </button>
          </div>

          <dl className="flex w-full items-center justify-center gap-10 py-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex min-w-[76px] flex-col-reverse items-center text-center"
              >
                <dt className="text-body3 font-medium tracking-[-0.012px] whitespace-nowrap text-fg-muted">
                  {stat.label}
                </dt>
                <dd className="text-head2 font-semibold tracking-[-0.018px] text-brand-contrast">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 기록 배너 */}
        <section className="relative h-[70px] overflow-hidden rounded-lg bg-brand-subtle">
          <p className="absolute top-[15px] left-[17px] text-body2 font-semibold tracking-[-0.014px] text-brand-contrast">
            지금까지 맛있는 혜택과
            <br />
            함께한 {profileStatus === "ready" ? `${nickname}님` : "회원님"}의
            기록이에요!
          </p>
          <img
            src={bannerCharacter}
            alt=""
            width={59}
            height={58}
            className="absolute top-3 right-[27px]"
          />
          <img
            src={bannerHeart}
            alt=""
            width={16}
            height={16}
            className="absolute top-[15px] right-[91px]"
          />
        </section>

        {/* 메뉴 */}
        <nav
          aria-label="마이 메뉴"
          className="flex flex-col overflow-hidden rounded-lg border-[0.5px] border-line"
        >
          {MENUS.map((menu) => (
            <button
              key={menu.key}
              type="button"
              onClick={() => navigate(menu.path)}
              className="flex w-full items-center justify-between border-b-[0.5px] border-line bg-surface p-3 text-left last:border-b-0"
            >
              <span className="flex items-center gap-3">
                <img src={menu.icon} alt="" width={24} height={24} />
                <span className="flex flex-col gap-0.5">
                  <span className="text-body2 font-semibold tracking-[-0.014px] text-fg">
                    {menu.title}
                  </span>
                  <span className="text-body3 font-medium tracking-[-0.012px] text-fg-muted">
                    {menu.description}
                  </span>
                </span>
              </span>
              <img src={chevronIcon} alt="" width={18} height={18} />
            </button>
          ))}
        </nav>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-20 mx-auto w-[min(362px,calc(100%-40px))]">
        <GNB
          active="my"
          className="pointer-events-auto shadow-[0_4px_12px_rgba(136,83,0,0.08)]"
        />
      </div>

      <ConfirmModal
        open={logoutOpen}
        image={characterSad}
        title="로그아웃할까요?"
        description="로그아웃하면 현재 계정의 쿠폰 사용이 제한될 수 있어요."
        cancelText="취소"
        confirmText="확인"
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </main>
  );
}
