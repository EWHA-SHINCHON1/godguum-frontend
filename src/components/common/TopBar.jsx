import logo from "../../assets/icons/logo.svg";
import bookmarkIcon from "../../assets/icons/topbar-bookmark.svg";
import IconButton from "./IconButton";
import { cn } from "./cn";

/**
 * 메인 탭 상단 바 (Figma: Top bar) — 로고 + 저장 목록 버튼
 */
export default function TopBar({ onLogoClick, onBookmarkClick, className }) {
  return (
    <header
      className={cn(
        "flex w-full items-center justify-between bg-transparent px-5 py-3",
        className,
      )}
    >
      <button
        type="button"
        onClick={onLogoClick}
        aria-label="갓구움 홈"
        className="shrink-0"
      >
        <img src={logo} alt="갓구움" width={76} height={40} />
      </button>
      <IconButton
        icon={bookmarkIcon}
        label="저장한 프로모션"
        onClick={onBookmarkClick}
      />
    </header>
  );
}
