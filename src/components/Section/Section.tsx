import { useId, type ReactNode } from 'react'
import { Link } from 'react-router'
import './Section.css'

interface SectionProps {
  title: string
  variant?: 'display' | 'plain'
  seeAllTo?: string
  children: ReactNode
}

export function Section({ title, variant = 'display', seeAllTo, children }: SectionProps) {
  const headingId = useId()

  return (
    <section className="section" aria-labelledby={headingId}>
      <header className="section__header">
        <h2 id={headingId} className={`section__title section__title--${variant}`}>
          {title}
        </h2>
        {seeAllTo && (
          <Link to={seeAllTo} className="section__see-all">
            See all
          </Link>
        )}
      </header>
      {children}
    </section>
  )
}
