import { useId, type InputHTMLAttributes } from 'react'
import { AlertCircleIcon, CheckIcon } from '../icons'
import './TextField.css'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  valid?: boolean
}

export function TextField({ label, error, valid, id, ...inputProps }: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`
  const state = error ? 'error' : valid ? 'valid' : undefined

  return (
    <div className="field" data-state={state}>
      <label htmlFor={inputId} className="field__label">
        {label}
      </label>
      <div className="field__control">
        <input
          id={inputId}
          className="field__input"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...inputProps}
        />
        {error && <AlertCircleIcon className="field__icon" size={16} />}
        {!error && valid && <CheckIcon className="field__icon" size={18} />}
      </div>
      {error && (
        <p id={errorId} className="field__error">
          {error}
        </p>
      )}
    </div>
  )
}
