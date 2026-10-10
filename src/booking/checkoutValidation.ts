import { validateEmail } from '../auth/validation'

export interface CheckoutValues {
  fullName: string
  email: string
  mobileNumber: string
  cardNumber: string
  expiry: string
  cvv: string
}

export const digitsOnly = (value: string) => value.replace(/\D/g, '')

export function formatCardNumber(value: string) {
  return digitsOnly(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
}

export function formatExpiry(value: string) {
  const digits = digitsOnly(value).slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

export function formatCvv(value: string) {
  return digitsOnly(value).slice(0, 3)
}

function validateFullName(name: string) {
  const trimmed = name.trim()
  if (!trimmed) return 'Full name is required'
  if (trimmed.length < 3) return 'At least 3 characters'
  if (trimmed.length > 50) return 'At most 50 characters'
}

function validateMobile(mobile: string) {
  const digits = mobile.replace(/\s/g, '')
  if (!digits) return 'Mobile number is required'
  if (!/^\d+$/.test(digits)) return 'Use digits only'
  if (!digits.startsWith('5')) return 'Georgian mobile numbers must start with 5'
  if (digits.length !== 9) return 'Mobile number must be 9 digits'
}

function validateCardNumber(card: string) {
  if (!card) return 'Card number is required'
  if (digitsOnly(card).length !== 16) return 'Card number must be 16 digits'
}

function validateExpiry(expiry: string, now = new Date()) {
  if (!expiry) return 'Expiry is required'
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(expiry)
  if (!match) return 'Use the MM/YY format'
  const month = Number(match[1])
  const year = 2000 + Number(match[2])
  const current = now.getFullYear() * 12 + now.getMonth()
  if (year * 12 + month - 1 < current) return 'This card has expired'
}

function validateCvv(cvv: string) {
  if (!cvv) return 'CVV is required'
  if (!/^\d{3}$/.test(cvv)) return 'CVV must be 3 digits'
}

export function validateCheckout(values: CheckoutValues) {
  return {
    fullName: validateFullName(values.fullName),
    email: validateEmail(values.email),
    mobileNumber: validateMobile(values.mobileNumber),
    cardNumber: validateCardNumber(values.cardNumber),
    expiry: validateExpiry(values.expiry),
    cvv: validateCvv(values.cvv),
  }
}
