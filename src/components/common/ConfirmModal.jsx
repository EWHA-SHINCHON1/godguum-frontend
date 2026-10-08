import { useEffect } from 'react'
import closeIcon from '../../assets/icons/close.svg'
import Button from './Button'
import IconButton from './IconButton'

/**
 * 확인 모달 (Figma: 로그아웃 확인 모달, 쿠폰 수령 모달)
 *
 *  <ConfirmModal
 *    open={open}
 *    image={characterSad}
 *    title="로그아웃할까요?"
 *    description="로그아웃하면 현재 계정의 쿠폰 사용이 제한될 수 있어요."
 *    cancelText="취소"
 *    confirmText="확인"
 *    onClose={() => setOpen(false)}
 *    onConfirm={logout}
 *  />
 *
 * cancelText 를 비우면 버튼이 하나만 나온다.
 */
export default function ConfirmModal({
  open,
  image,
  title,
  description,
  cancelText = '취소',
  confirmText = '확인',
  onClose,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-[362px] flex-col gap-4 rounded-xl bg-brand-surface py-5"
      >
        <div className="flex justify-end px-4">
          <IconButton icon={closeIcon} label="닫기" onClick={onClose} />
        </div>

        <div className="flex flex-col items-center gap-5">
          <div className="flex w-[227px] flex-col items-center gap-4 text-center">
            {image && <img src={image} alt="" width={150} height={120} />}
            <div className="flex flex-col gap-2">
              <h2 id="confirm-modal-title" className="text-head2 font-semibold text-fg">
                {title}
              </h2>
              {description && (
                <p className="text-body2 font-medium break-keep text-fg-subtle">{description}</p>
              )}
            </div>
          </div>

          <div className="flex w-full gap-2 px-4">
            {cancelText && (
              <Button variant="outline" size="md" className="flex-1" onClick={onCancel ?? onClose}>
                {cancelText}
              </Button>
            )}
            <Button variant="primary" size="md" className="flex-1" onClick={onConfirm}>
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
