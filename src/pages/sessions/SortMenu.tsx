import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { CheckIcon, ChevronDownIcon } from '../../components/icons'
import type { SessionSort } from '../../types/session'

interface SortMenuProps {
  options: { id: SessionSort; label: string }[]
  value: SessionSort
  onChange: (sort: SessionSort) => void
}

export function SortMenu({ options, value, onChange }: SortMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const menuId = useId()
  const current = options.find((option) => option.id === value) ?? options[0]

  useEffect(() => {
    if (!isOpen) return
    const selectedIndex = Math.max(
      0,
      options.findIndex((option) => option.id === value),
    )
    itemRefs.current[selectedIndex]?.focus()
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen, options, value])

  const close = () => {
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  const choose = (sort: SessionSort) => {
    close()
    if (sort !== value) onChange(sort)
  }

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = itemRefs.current.filter(Boolean) as HTMLButtonElement[]
    const index = items.indexOf(document.activeElement as HTMLButtonElement)
    const focusAt = (next: number) => items[(next + items.length) % items.length]?.focus()

    if (event.key === 'ArrowDown') focusAt(index + 1)
    else if (event.key === 'ArrowUp') focusAt(index - 1)
    else if (event.key === 'Home') focusAt(0)
    else if (event.key === 'End') focusAt(items.length - 1)
    else if (event.key === 'Escape' || event.key === 'Tab') close()
    else return
    event.preventDefault()
  }

  if (!current) return null

  return (
    <div className="sort-menu" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className="sort-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="sort-menu__prefix">Sort:</span>
        <strong>{current.label}</strong>
        <ChevronDownIcon size={16} className="sort-menu__chevron" />
      </button>

      {isOpen && (
        <div
          id={menuId}
          className="sort-menu__list"
          role="menu"
          aria-label="Sort sessions"
          onKeyDown={handleMenuKeyDown}
        >
          {options.map((option, index) => (
            <button
              key={option.id}
              ref={(element) => {
                itemRefs.current[index] = element
              }}
              type="button"
              role="menuitemradio"
              aria-checked={option.id === value}
              className="sort-menu__option"
              tabIndex={-1}
              onClick={() => choose(option.id)}
            >
              {option.label}
              {option.id === value && <CheckIcon size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
