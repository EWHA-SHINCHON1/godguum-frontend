import { useEffect, useState } from "react";
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
import { MOCK_COUPONS, MOCK_USER } from "../../mocks/coupons";
import { getSavedPromotions } from "../../api/promotions";

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

/** 4-1-1 마이 */
export default function MyPage() {
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);

  // 저장한 프로모션 수: 서버 저장 목록 응답의 count (전체 개수)
  // 비로그인(401)·오류면 0 으로 표시
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    getSavedPromotions()
      .then((data) => {
        if (isCurrent) setSavedCount(data.count ?? 0);
      })
      .catch(() => {
        if (isCurrent) setSavedCount(0);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const stats = [
    { label: "전체 쿠폰", value: MOCK_COUPONS.length },
    {
      label: "사용한 쿠폰",
      value: MOCK_COUPONS.filter((coupon) => coupon.status === "used").length,
    },
    { label: "저장한 프로모션", value: savedCount },
  ];

  const handleLogout = () => {
    // TODO: 인증 연동 시 토큰 삭제 등 로그아웃 처리
    setLogoutOpen(false);
    navigate("/login", { replace: true });
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
                <p className="text-head2 font-semibold tracking-[-0.018px] text-fg">
                  {MOCK_USER.name}님
                </p>
                <p className="text-body3 font-medium tracking-[-0.012px] text-fg-muted">
                  {MOCK_USER.greeting}
                </p>
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
            함께한 {MOCK_USER.name}님의 기록이에요!
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
