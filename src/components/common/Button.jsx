import { cn } from "./cn";

/**
 * 공통 버튼 (Figma: ActionBtn / small / ActionBtn)
 
 * variant
 *  - primary   : 노란 배경 (적용하기, 확인)
 *  - secondary : 연한 노란 배경 (프로모션 둘러보기)
 *  - outline   : 흰 배경 + 노란 테두리 (취소)
 * size
 *  - lg : 높이 48px (ActionBtn, small)
 *  - md : 높이 44px (모달 버튼)
 */
const VARIANTS = {
  primary: "bg-brand text-fg",
  secondary: "bg-brand-subtle text-fg",
  outline: "bg-surface border border-brand text-fg-muted",
};

const SIZES = {
  lg: "h-12 px-2.5",
  md: "h-11 px-3",
};

export default function Button({
  variant = "primary",
  size = "lg",
  fullWidth = false,
  type = "button",
  className,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-full whitespace-nowrap",
        "text-body1 leading-[1.5] font-semibold",
        "transition-opacity active:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
