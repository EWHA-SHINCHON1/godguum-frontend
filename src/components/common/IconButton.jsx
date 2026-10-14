import { cn } from "./cn";

/**
 * X (닫기) 아이콘만 있는 버튼. 시각 크기는 아이콘 그대로, 터치 영역은 40px 확보.
 */
export default function IconButton({
  icon,
  label,
  size = 24,
  onClick,
  className,
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "-m-2 inline-flex size-10 shrink-0 items-center justify-center",
        className,
      )}
    >
      <img src={icon} alt="" width={size} height={size} />
    </button>
  );
}
