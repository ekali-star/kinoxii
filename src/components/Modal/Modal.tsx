import { useEffect, useId, useRef, type ReactNode } from 'react'
import { CloseIcon } from '../icons'
import './Modal.css'

interface ModalProps {
  title: string
  subtitle?: string
  size?: 'sm' | 'md'
  onClose: () => void
  closeOnBackdropClick?: boolean
  children: ReactNode
}

export function Modal({
  title,
  subtitle,
  size = 'sm',
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
        <header className="modal__header">
          <div>
            <h2 id={titleId} className="modal__title">
              {title}
            </h2>
            {subtitle && <p className="modal__subtitle">{subtitle}</p>}
          </div>
          <button type="button" className="modal__close" aria-label="Close" onClick={onClose}>
            <CloseIcon size={24} />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  )
}
