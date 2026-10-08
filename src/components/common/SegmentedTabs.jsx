import { cn } from './cn'

/**
 * 2개 이상 선택지 중 하나를 고르는 pill 탭 (Figma: 쿠폰 상태)
 *
 *  <SegmentedTabs
 *    items={[{ value: 'available', label: '사용 가능 (3)' }, { value: 'used', label: '사용 완료 (8)' }]}
 *    value={tab}
 *    onChange={setTab}
 *  />
 */
export default function SegmentedTabs({ items, value, onChange, className }) {
  return (
    <div role="tablist" className={cn('flex w-full items-center gap-2 px-5', className)}>
      {items.map((item) => {
        const selected = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange?.(item.value)}
            className={cn(
              'flex h-11 min-w-0 flex-1 items-center justify-center rounded-full whitespace-nowrap transition-colors',
              selected
                ? 'bg-brand text-body1 leading-[1.5] font-semibold text-fg'
                : 'bg-brand-weak text-button font-medium text-fg-muted',
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
