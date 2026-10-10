export interface Format {
  id: number
  slug: string
  name: string
  priceUplift: number
}

export interface Venue {
  id: number
  slug: string
  name: string
  city: string
  formats: Format[]
}

export interface User {
  id: number
  username: string
  email: string
  avatar: string | null
  fullName: string | null
  mobileNumber: string | null
  dateOfBirth: string | null
  age: number | null
  preferredVenue?: Venue | null
  profileComplete: boolean
}
