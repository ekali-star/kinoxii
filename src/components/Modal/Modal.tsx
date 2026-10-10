import { useEffect, useId, useRef, type ReactNode } from 'react'
import { CloseIcon } from '../icons'
import './Modal.css'

interface ModalProps {
  title: string
  subtitle?: string
  size?: 'sm' | 'md' | 'lg'
  headerAside?: ReactNode
  hideHeader?: boolean
  onClose: () => void
  closeOnBackdropClick?: boolean
  children: ReactNode
}

export function Modal({
  title,
  subtitle,
  size = 'sm',
  headerAside,
  hideHeader = false,
  onClose,
  closeOnBackdropClick = true,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const pressedBackdrop = useRef(false)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.showModal()
    return () => dialog.close()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className={`modal modal--${size}`}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onPointerDown={(event) => {
        pressedBackdrop.current = event.target === event.currentTarget
      }}
      onClick={(event) => {
        if (closeOnBackdropClick && pressedBackdrop.current && event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="modal__panel">
        <header className={hideHeader ? 'modal__header modal__header--hidden' : 'modal__header'}>
          <div className="modal__heading">
            <h2 id={titleId} className="modal__title">
              {title}
            </h2>
            {subtitle && <p className="modal__subtitle">{subtitle}</p>}
          </div>
          <div className="modal__header-aside">
            {headerAside}
            <button type="button" className="modal__close" aria-label="Close" onClick={onClose}>
              <CloseIcon size={24} />
            </button>
          </div>
        </header>
        {children}
      </div>
    </dialog>
  )
}
