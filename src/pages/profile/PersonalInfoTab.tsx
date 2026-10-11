import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { ApiError } from '../../api/client'
import { updateProfile } from '../../api/profile'
import { useAuth } from '../../auth/useAuth'
import { useFormFields } from '../../auth/useFormFields'
import { mapApiErrors } from '../../auth/validation'
import { useFilterOptions } from '../../booking/queries'
import { AlertCircleIcon, CheckIcon } from '../../components/icons'
import { SelectField } from '../../components/TextField/SelectField'
import { TextField } from '../../components/TextField/TextField'
import { toISODate } from '../../lib/format'
import { formatMobile, validateProfile, type ProfileValues } from '../../profile/profileValidation'
import type { AgeRating } from '../../types/movie'
import type { User } from '../../types/user'

const API_FIELDS = {
  fullName: 'fullName',
  mobileNumber: 'mobileNumber',
  dateOfBirth: 'dateOfBirth',
  preferredVenueId: 'preferredVenueId',
} as const

function ageNotice(age: number | null, ratings: AgeRating[]) {
  if (age === null) return undefined
  const restricted = ratings.filter((rating) => rating.minAge > age).map((rating) => rating.code)
  if (restricted.length === 0) return `You are ${age}, you can buy tickets for all age ratings.`
  return `You are ${age}, you cannot buy tickets for ${restricted.join(' or ')} titles.`
}

function ProfileStatus({ user }: { user: User }) {
  return user.profileComplete ? (
    <p className="profile-status profile-status--complete" role="status">
      Profile Complete
      <CheckIcon size={18} />
    </p>
  ) : (
    <div className="profile-status profile-status--incomplete" role="status">
      <AlertCircleIcon size={18} />
      <div>
        <strong>Profile incomplete</strong>
        <span>Please complete your profile to enable booking.</span>
      </div>
    </div>
  )
}

function toValues(user: User): ProfileValues {
  return {
    fullName: user.fullName ?? '',
    email: user.email,
    mobileNumber: formatMobile(user.mobileNumber ?? ''),
    dateOfBirth: user.dateOfBirth ?? '',
    preferredVenueId: user.preferredVenue ? String(user.preferredVenue.id) : '',
  }
}

interface ProfileFormProps {
  user: User
  onSaved: (user: User) => void
}

function ProfileForm({ user, onSaved }: ProfileFormProps) {
  const options = useFilterOptions()
  const [baseline, setBaseline] = useState(() => toValues(user))
  const [formError, setFormError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const { values, inputProps, validateAll, setServerErrors } = useFormFields(
    baseline,
    validateProfile,
    { mobileNumber: formatMobile },
  )
  const save = useMutation({ mutationFn: updateProfile })

  const fields = Object.keys(baseline) as (keyof ProfileValues)[]
  const isDirty = fields.some((field) => values[field] !== baseline[field])
  const isValid = !Object.values(validateProfile(values)).some(Boolean)
  const isSavedBirthDate = values.dateOfBirth === user.dateOfBirth

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    setSaved(false)
    if (!validateAll()) return

    try {
      const updated = await save.mutateAsync({
        fullName: values.fullName.trim(),
        mobileNumber: values.mobileNumber.replace(/\s/g, ''),
        dateOfBirth: values.dateOfBirth,
        preferredVenueId: values.preferredVenueId ? Number(values.preferredVenueId) : null,
      })
      onSaved(updated)
      setBaseline(values)
      setSaved(true)
    } catch (error) {
      if (error instanceof ApiError && error.isValidationError && error.errors) {
        setServerErrors(mapApiErrors(error.errors, API_FIELDS))
        if (Object.keys(error.errors).some((key) => !(key in API_FIELDS))) {
          setFormError(error.message)
        }
      } else {
        setFormError(error instanceof ApiError ? error.message : "Couldn't save your profile.")
      }
    }
  }

  return (
    <form className="profile-form" noValidate onSubmit={handleSubmit}>
      <TextField label="Full name" autoComplete="name" {...inputProps('fullName')} />
      <TextField
        label="Email"
        type="email"
        value={user.email}
        disabled
        readOnly
        hint="Set at registration and cannot be changed"
      />
      <TextField
        label="Mobile number"
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="5XX XXX XXX"
        {...inputProps('mobileNumber')}
      />
      <TextField
        label="Date of birth"
        type="date"
        min="1900-01-01"
        max={toISODate(new Date())}
        hint={
          isSavedBirthDate ? ageNotice(user.age, options.data?.ageRatings ?? []) : undefined
        }
        {...inputProps('dateOfBirth')}
      />
      <SelectField
        label="Preferred Venue (Optional)"
        placeholder="No preference"
        options={(options.data?.venues ?? []).map((venue) => ({
          value: String(venue.id),
          label: `${venue.name} · ${venue.city}`,
        }))}
        name="preferredVenueId"
        value={values.preferredVenueId}
        onChange={inputProps('preferredVenueId').onChange}
      />

      {formError && (
        <p className="profile-form__error" role="alert">
          {formError}
        </p>
      )}

      <div className="profile-form__actions">
        <button
          type="submit"
          className="button button--primary"
          disabled={!isDirty || !isValid || save.isPending}
        >
          {save.isPending ? 'Saving…' : 'Save changes'}
        </button>
        {saved && !isDirty && (
          <p className="profile-form__saved" role="status">
            <CheckIcon size={16} />
            Changes saved
          </p>
        )}
      </div>
    </form>
  )
}

export function PersonalInfoTab() {
  const { user, setUser } = useAuth()
  if (!user) return null

  return (
    <div className="personal-info">
      <ProfileStatus user={user} />
      <ProfileForm user={user} onSaved={setUser} />
    </div>
  )
}
