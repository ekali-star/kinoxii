import { useParams } from 'react-router'

export function MovieDetailsPage() {
  const { slug } = useParams<{ slug: string }>()

  return (
    <section className="page">
      <h1 className="page__title">{slug}</h1>
    </section>
  )
}
