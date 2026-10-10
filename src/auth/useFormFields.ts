import { useState, type ChangeEvent } from 'react'
import { hasErrors, type FieldErrors } from './validation'

export function useFormFields<Field extends string>(
  initialValues: Record<Field, string>,
  validate: (values: Record<Field, string>) => FieldErrors<Field>,
) {
  const [values, setValues] = useState(initialValues)
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [serverErrors, setServerErrors] = useState<FieldErrors<Field>>({})

  const clientErrors = validate(values)
  const fields = Object.keys(initialValues) as Field[]

  const errorFor = (field: Field) =>
    serverErrors[field] ?? (touched[field] ? clientErrors[field] : undefined)

  const isValid = (field: Field) =>
    Boolean(touched[field] && values[field] && !errorFor(field))

  const inputProps = (field: Field) => ({
    name: field,
    value: values[field],
    error: errorFor(field),
    valid: isValid(field),
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target
      setValues((current) => ({ ...current, [field]: value }))
      setServerErrors((current) => ({ ...current, [field]: undefined }))
    },
    onBlur: () => {
      if (values[field]) setTouched((current) => ({ ...current, [field]: true }))
    },
  })

  const validateAll = () => {
    setTouched(Object.fromEntries(fields.map((field) => [field, true])) as Record<Field, boolean>)
    return !hasErrors(clientErrors)
  }

  const isFilled = fields.every((field) => values[field] !== '')

  return { values, inputProps, validateAll, setServerErrors, isFilled }
}
