import { useId, type InputHTMLAttributes } from 'react'
import { AlertCircleIcon, CheckIcon } from '../icons'
import './TextField.css'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  valid?: boolean
  hint?: string
}

export function TextField({ label, error, valid, hint, id, ...inputProps }: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`
  const describedBy = error ? errorId : hint ? hintId : undefined
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
          aria-describedby={describedBy}
          {...inputProps}
        />
        {error && <AlertCircleIcon className="field__icon" size={16} />}
        {!error && valid && <CheckIcon className="field__icon" size={18} />}
      </div>
      {error ? (
        <p id={errorId} className="field__error">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="field__hint">
            {hint}
          </p>
        )
      )}
    </div>
  )
}
