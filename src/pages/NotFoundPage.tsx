import { Link } from 'react-router'
import { paths } from '../routes/paths'

export function NotFoundPage() {
  return (
    <section className="page page--centered">
      <h1 className="page__title">Page not found</h1>
      <p className="page__lead">The page you are looking for does not exist or has moved.</p>
      <Link to={paths.home} className="button button--primary">
        Back to home
      </Link>
    </section>
  )
}
