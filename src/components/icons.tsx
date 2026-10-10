import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Icon({ size = 20, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export const CloseIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5 5l14 14M19 5L5 19" />
  </Icon>
)

export const CheckIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 12.5l5 5L20 6.5" />
  </Icon>
)

export const AlertCircleIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5M12 16.5v.01" />
  </Icon>
)

export const UploadIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </Icon>
)

export const UserIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
  </Icon>
)

export const TicketIcon = (props: IconProps) => (
  <Icon {...props} fill="currentColor" stroke="none">
    <path d="M14.6 2.6a1.5 1.5 0 0 1 2.1 0l1.4 1.4a.9.9 0 0 1 0 1.2 1.8 1.8 0 0 0 2.6 2.6.9.9 0 0 1 1.2 0l1.4 1.4a1.5 1.5 0 0 1 0 2.1L11.4 23.2a1.5 1.5 0 0 1-2.1 0L7.9 21.8a.9.9 0 0 1 0-1.2 1.8 1.8 0 0 0-2.6-2.6.9.9 0 0 1-1.2 0L2.7 16.6a1.5 1.5 0 0 1 0-2.1z" />
  </Icon>
)

export const LogoutIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 8l-4 4 4 4M6 12h10" />
  </Icon>
)

export const ChevronDownIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
)
