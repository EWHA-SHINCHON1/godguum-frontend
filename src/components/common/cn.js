// className 조합 헬퍼
// 인자에 들어간 값이 true면 class로 넣어주고, false면 안넣어준다 !

// <div className={cn('checkbox', { checked })}>
// className에 true에 해당하는 값은 추가로 표시가 되고, false가 된다면 className에 적용되지 않는다.

// 코드 간결화를 위한 것 (안써도 되긴함)

export const cn = (...classes) => classes.filter(Boolean).join(" ");
