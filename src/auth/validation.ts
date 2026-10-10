export type FieldErrors<Field extends string> = Partial<Record<Field, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const MIN_USERNAME_LENGTH = 3
export const MIN_PASSWORD_LENGTH = 3

export const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const AVATAR_ACCEPT = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp'
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024

export function validateEmail(email: string) {
  if (!email.trim()) return 'Email is required'
  if (!EMAIL_PATTERN.test(email.trim())) return 'Enter a valid email address'
}

export function validatePassword(password: string) {
  if (!password) return 'Password is required'
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `At least ${MIN_PASSWORD_LENGTH} characters`
  }
}

export function validateUsername(username: string) {
  if (!username.trim()) return 'Username is required'
  if (username.trim().length < MIN_USERNAME_LENGTH) {
    return `At least ${MIN_USERNAME_LENGTH} characters`
  }
}

export function validatePasswordConfirmation(password: string, confirmation: string) {
  if (!confirmation) return 'Please confirm your password'
  if (password !== confirmation) return 'Passwords do not match'
}

export function validateAvatar(file: File) {
  if (!AVATAR_TYPES.includes(file.type)) return 'Avatar must be a JPG, PNG or WEBP image'
  if (file.size > AVATAR_MAX_BYTES) return 'Avatar must be 2MB or smaller'
}

export function hasErrors(errors: FieldErrors<string>) {
  return Object.values(errors).some(Boolean)
}

export function mapApiErrors<Field extends string>(
  apiErrors: Record<string, string[]>,
  fieldsByApiKey: Record<string, Field>,
): FieldErrors<Field> {
  const errors: FieldErrors<Field> = {}
  for (const [apiKey, messages] of Object.entries(apiErrors)) {
    const field = fieldsByApiKey[apiKey]
    if (field && messages[0]) errors[field] = messages[0]
  }
  return errors
}
