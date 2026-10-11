import { useId, type SelectHTMLAttributes } from 'react'
import { ChevronDownIcon } from '../icons'
import './TextField.css'

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function SelectField({ label, options, placeholder, id, ...selectProps }: SelectFieldProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <div className="field">
      <label htmlFor={selectId} className="field__label">
        {label}
      </label>
      <div className="field__control">
        <select id={selectId} className="field__input field__select" {...selectProps}>
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="field__icon" size={18} />
      </div>
    </div>
  )
}
