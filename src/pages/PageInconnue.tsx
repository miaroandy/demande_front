import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../lib/hooks'

export function PageInconnue() {
  useDocumentTitle('Page introuvable')
  return (
    <section className="page page-etroite">
      <h1>Page introuvable</h1>
      <p>
        <Link to="/">Retour aux demandes</Link>
      </p>
    </section>
  )
}
