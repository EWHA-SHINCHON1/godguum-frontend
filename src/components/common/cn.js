import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/*
 * index.css 에 정의한 커스텀 글자 크기 토큰(text-head1, text-body3 ...)을
 * tailwind-merge 에 알려준다. 등록하지 않으면 text-body3 를 "글자 색"으로 착각해서
 * 뒤에 오는 text-fg 같은 색 클래스와 충돌한다고 보고 크기 클래스를 지워버린다.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["head1", "head2", "body1", "body2", "body3", "button", "caption1"],
    },
  },
});

export const cn = (...inputs) => {
  return twMerge(clsx(inputs));
};
