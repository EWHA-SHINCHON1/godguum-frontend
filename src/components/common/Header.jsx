import chevronLeft from "../../assets/icons/chevron-left.svg";
import { cn } from "./cn";

/**
 * 서브 화면 헤더 (Figma: 헤더)
 * 뒤로가기 · 가운데 제목 · 오른쪽 슬롯(저장 버튼 등) 조합으로 모든 Type을 표현한다.
 *
 *  <Header title="매장 정보" onBack={...} />
 *  <Header onBack={...} right={<HeaderBookmarkButton />} />   // Type=저장만
 *  <Header onBack={...} />                                    // Type=none
 *
 */

export default function Header({
  title, // 문자열 가운데 제목
  onBack, // 뒤로가기 버튼을 눌렀을 때 실행할 함수
  showBack = true, // boolean	뒤로가기 버튼을 보일지 여부 (기본 true)
  right, // JSX	오른쪽 칸에 넣을 내용
  className,
}) {
  return (
    <header
      className={cn(
        "relative flex h-[60px] w-full items-center justify-between bg-surface px-5",
        className,
      )}
    >
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로가기"
          className="-m-2 inline-flex size-10 items-center justify-center"
        >
          <img src={chevronLeft} alt="" width={10} height={17} />
        </button>
      ) : (
        <span className="size-6" />
      )}

      {/*true일 때만 JSX를 화면에 보여주고, 거짓(false)일 때는 아무것도 보여주지 않음*/}
      {title && (
        <h1 className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-head1 font-semibold whitespace-nowrap text-fg">
          {title}
        </h1>
      )}

      <div className="flex min-w-6 items-center justify-end gap-3">{right}</div>
    </header>
  );
}
