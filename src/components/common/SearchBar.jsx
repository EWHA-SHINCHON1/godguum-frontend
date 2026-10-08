import searchIcon from '../../assets/icons/search.svg'
import { cn } from './cn'

/**
 * 검색창 (Figma: 검색창, Type=default / typing / done)
 * default·typing·done 상태는 placeholder, focus, 입력값으로 자연스럽게 표현된다.
 *
 * - 홈처럼 누르면 검색 화면으로 이동만 하는 경우: readOnly + onClick
 * - 실제 입력: value / onChange / onSubmit
 */
export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = '가게나 프로모션을 검색해보세요',
  readOnly = false,
  onClick,
  autoFocus,
  className,
}) {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit?.(value)
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-[50px] border-[0.5px] border-line bg-surface px-4 py-2.5',
        readOnly && 'cursor-pointer',
        className,
      )}
    >
      <img src={searchIcon} alt="" width={20} height={20} className="shrink-0" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        autoFocus={autoFocus}
        className={cn(
          'min-w-0 flex-1 bg-transparent text-body2 font-medium text-fg outline-none',
          'placeholder:text-fg-muted caret-[#0048ff]',
          '[&::-webkit-search-cancel-button]:hidden',
          readOnly && 'pointer-events-none',
        )}
      />
    </form>
  )
}
