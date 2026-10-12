import homeFilled from "../../assets/icons/home-filled.svg";
import homeStroke from "../../assets/icons/home-stroke.svg";
import promotionFilled from "../../assets/icons/promotion-filled.svg";
import promotionStroke from "../../assets/icons/promotion-stroke.svg";
import myFilled from "../../assets/icons/my-filled.svg";
import myStroke from "../../assets/icons/my-stroke.svg";
import { useNavigate } from "react-router-dom";
import { cn } from "./cn";

/**
 * 하단 GNB (Figma: BottomNav, Type=Home / Promotion / My)
 * 화면 하단에 떠 있는 pill 형태. 위치(fixed 등)는 사용하는 레이아웃에서 정한다.
 * 탭을 누르면 NAV_ITEMS의 path로 이동한다. onChange를 넘기면 이동 대신 onChange가 실행된다.
 */
export const NAV_ITEMS = [
  {
    key: "home",
    label: "홈",
    path: "/home",
    icon: homeStroke,
    activeIcon: homeFilled,
  },
  {
    key: "promotion",
    label: "프로모션",
    path: "/promotions",
    icon: promotionStroke,
    activeIcon: promotionFilled,
  },
  // TODO: 마이 화면 추가 후 path 연결
  {
    key: "my",
    label: "마이",
    path: null,
    icon: myStroke,
    activeIcon: myFilled,
  },
];

export default function GNB({ active = "home", onChange, className }) {
  const navigate = useNavigate();

  const handleClick = (item) => {
    if (onChange) {
      onChange(item.key);
      return;
    }
    if (item.key !== active && item.path) navigate(item.path);
  };

  return (
    <nav
      aria-label="하단 메뉴"
      className={cn(
        "flex w-full items-center justify-between rounded-full bg-brand-nav px-8 py-3",
        className,
      )}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => handleClick(item)}
            className="flex w-[42px] flex-col items-center gap-1"
          >
            <img
              src={isActive ? item.activeIcon : item.icon}
              alt=""
              width={24}
              height={24}
            />
            <span className="text-caption1 font-semibold whitespace-nowrap text-black">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
