import { useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { Modal } from '../components/Modal/Modal'
import { TextField } from '../components/TextField/TextField'
import type { LoginRequest } from '../types/auth'
import { useAuth } from './useAuth'
import { useFormFields } from './useFormFields'
import { mapApiErrors, validateEmail, validatePassword } from './validation'
import './AuthForm.css'

interface LoginModalProps {
  onClose: () => void
  onSuccess: () => void
  onSwitchToRegister: () => void
}

function validate(values: LoginRequest) {
  return {
    email: validateEmail(values.email),
    password: validatePassword(values.password),
  }
}

export function LoginModal({ onClose, onSuccess, onSwitchToRegister }: LoginModalProps) {
  const { login } = useAuth()
  const form = useFormFields<keyof LoginRequest>({ email: '', password: '' }, validate)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    if (!form.validateAll()) return

    setIsSubmitting(true)
    try {
      await login({ email: form.values.email.trim(), password: form.values.password })
      onSuccess()
    } catch (error) {
      if (error instanceof ApiError && error.errors) {
        form.setServerErrors(mapApiErrors(error.errors, { email: 'email', password: 'password' }))
      } else if (error instanceof ApiError) {
        setFormError(error.message)
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title="Log in" subtitle="Welcome back to Kino XII" onClose={onClose}>
      <form className="auth-form" noValidate onSubmit={handleSubmit}>
        <div className="auth-form__fields">
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="example@gmail.com"
            autoFocus
            {...form.inputProps('email')}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...form.inputProps('password')}
          />
        </div>

        {formError && (
          <p className="auth-form__alert" role="alert">
            {formError}
          </p>
        )}

        <button
          type="submit"
          className="button button--primary button--block"
          disabled={!form.isFilled || isSubmitting}
        >
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>

        <p className="auth-form__switch">
          Don't have an account?{' '}
          <button type="button" className="link-button" onClick={onSwitchToRegister}>
            Sign up
          </button>
        </p>
      </form>
    </Modal>
  )
}
