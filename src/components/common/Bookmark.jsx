import filledIcon from "../../assets/icons/bookmark-filled.svg";
import outlineIcon from "../../assets/icons/bookmark-outline.svg";
import { cn } from "./cn";

/**
 * 프로모션 저장 토글 (Figma: bookmark)
 * saved=true → 노란색 채워진 아이콘
 *
 * 카드 전체가 클릭 영역일 때 카드 이동이 같이 일어나지 않도록 전파를 막는다... 는데 이게 꼭 필요한가..?
 */

export default function Bookmark({
  saved = false,
  onToggle,
  size = 16,
  className,
}) {
  const handleClick = (e) => {
    e.stopPropagation(); // 클릭이 상위로 전달되는것을 막음
    e.preventDefault();
    // 어떤 이벤트를 명시적으로 처리하지 않은 경우,
    // 해당 이벤트에 대한 사용자 에이전트의 기본 동작을 실행하지 않도록 지정
    // 왜 필요한거지..?

    onToggle?.(!saved);
    // ?.() => optional chaining = "있으면 실행하고 없으면 넘어감"
    // saved가 false인 경우 → onToggle이 있으면 onToggle(true) 실행
  };

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "저장 취소" : "저장하기"}
      onClick={handleClick}
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        className,
      )}
    >
      <img
        src={saved ? filledIcon : outlineIcon}
        alt=""
        width={size}
        height={size}
      />
    </button>
  );
}
