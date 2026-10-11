import { toISODate } from '../lib/format'

export const MIN_AGE = 12

export interface ProfileValues {
  fullName: string
  email: string
  mobileNumber: string
  dateOfBirth: string
  preferredVenueId: string
}

export function formatMobile(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 9)
    .replace(/^(\d{3})(\d{1,3})?(\d{1,3})?$/, (_, a: string, b?: string, c?: string) =>
      [a, b, c].filter(Boolean).join(' '),
    )
}

function validateFullName(name: string) {
  const trimmed = name.trim()
  if (!trimmed) return 'Name is required'
  if (trimmed.length < 3) return 'Name must be at least 3 characters'
  if (trimmed.length > 50) return 'Name must not exceed 50 characters'
}

function validateMobile(mobile: string) {
  const digits = mobile.replace(/\s/g, '')
  if (!digits) return 'Mobile number is required'
  if (!/^\d+$/.test(digits)) {
    return 'Please enter a valid Georgian mobile number (9 digits starting with 5)'
  }
  if (!digits.startsWith('5')) return 'Georgian mobile numbers must start with 5'
  if (digits.length !== 9) return 'Mobile number must be exactly 9 digits'
}

export function latestBirthDate(today = new Date()) {
  return toISODate(new Date(today.getFullYear() - MIN_AGE, today.getMonth(), today.getDate()))
}

function validateDateOfBirth(date: string, today = new Date()) {
  if (!date) return 'Date of birth is required'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > toISODate(today) || date < '1900-01-01') {
    return 'Please enter a valid date of birth'
  }
  if (date > latestBirthDate(today)) {
    return `You must be at least ${MIN_AGE} years old to create an account`
  }
}

export function validateProfile(values: ProfileValues) {
  return {
    fullName: validateFullName(values.fullName),
    mobileNumber: validateMobile(values.mobileNumber),
    dateOfBirth: validateDateOfBirth(values.dateOfBirth),
  }
}
