interface SectionErrorProps {
  message: string
  onRetry: () => unknown
}

export function SectionError({ message, onRetry }: SectionErrorProps) {
  return (
    <p className="section-message" role="alert">
      {message}
      <button type="button" className="link-button" onClick={() => onRetry()}>
        Retry
      </button>
    </p>
  )
}
