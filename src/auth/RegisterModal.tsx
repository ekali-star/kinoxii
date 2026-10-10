import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { Modal } from '../components/Modal/Modal'
import { TextField } from '../components/TextField/TextField'
import { UploadIcon } from '../components/icons'
import { useAuth } from './useAuth'
import { useFormFields } from './useFormFields'
import {
  AVATAR_ACCEPT,
  mapApiErrors,
  validateAvatar,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateUsername,
} from './validation'
import './AuthForm.css'

interface RegisterValues {
  username: string
  email: string
  password: string
  confirmPassword: string
}

type RegisterField = keyof RegisterValues

interface RegisterModalProps {
  onClose: () => void
  onSuccess: () => void
  onSwitchToLogin: () => void
}

const API_FIELDS: Record<string, RegisterField> = {
  username: 'username',
  email: 'email',
  password: 'password',
  password_confirmation: 'confirmPassword',
}

function validate(values: RegisterValues) {
  return {
    username: validateUsername(values.username),
    email: validateEmail(values.email),
    password: validatePassword(values.password),
    confirmPassword: validatePasswordConfirmation(values.password, values.confirmPassword),
  }
}

export function RegisterModal({ onClose, onSuccess, onSwitchToLogin }: RegisterModalProps) {
  const { register } = useAuth()
  const form = useFormFields<RegisterField>(
    { username: '', email: '', password: '', confirmPassword: '' },
    validate,
  )
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState<string | undefined>()
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const previewRef = useRef<string | null>(null)
  useEffect(() => {
    previewRef.current = avatarPreview
  }, [avatarPreview])
  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    },
    [],
  )

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const error = validateAvatar(file)
    setAvatarError(error)
    if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    setAvatar(error ? null : file)
    setAvatarPreview(error ? null : URL.createObjectURL(file))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    if (!form.validateAll()) return

    setIsSubmitting(true)
    try {
      await register({
        username: form.values.username.trim(),
        email: form.values.email.trim(),
        password: form.values.password,
        password_confirmation: form.values.confirmPassword,
        avatar,
      })
      onSuccess()
    } catch (error) {
      if (error instanceof ApiError && error.errors) {
        form.setServerErrors(mapApiErrors(error.errors, API_FIELDS))
        setAvatarError(error.errors.avatar?.[0])
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
    <Modal
      title="Sign up"
      subtitle="Welcome to Kino XII"
      size="md"
      onClose={onClose}
      closeOnBackdropClick={false}
    >
      <form className="auth-form" noValidate onSubmit={handleSubmit}>
        <div className="auth-form__fields">
          <div className="avatar-upload">
            <button
              type="button"
              className="avatar-upload__trigger"
              aria-describedby={avatarError ? 'avatar-error' : undefined}
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="avatar-upload__tile">
                {avatarPreview ? <img src={avatarPreview} alt="" /> : <UploadIcon size={18} />}
              </span>
              <span className="avatar-upload__text">
                <span className="avatar-upload__title">Upload avatar (optional)</span>
                <span className="avatar-upload__hint">JPG, PNG or WEBP</span>
              </span>
            </button>
            {avatarError && (
              <p id="avatar-error" className="field__error" role="alert">
                {avatarError}
              </p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={AVATAR_ACCEPT}
              hidden
              onChange={handleAvatarChange}
            />
          </div>

          <TextField
            label="Username"
            autoComplete="username"
            placeholder="User"
            autoFocus
            {...form.inputProps('username')}
          />
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="example@gmail.com"
            {...form.inputProps('email')}
          />
          <div className="auth-form__row">
            <TextField
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              {...form.inputProps('password')}
            />
            <TextField
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              {...form.inputProps('confirmPassword')}
            />
          </div>
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
          {isSubmitting ? 'Signing up…' : 'Sign up'}
        </button>

        <p className="auth-form__switch">
          Already have an account?{' '}
          <button type="button" className="link-button" onClick={onSwitchToLogin}>
            Log in
          </button>
        </p>
      </form>
    </Modal>
  )
}
