import type { ReactNode } from 'react'

export function Alerte({ ton, children }: { ton: 'erreur' | 'info' | 'succes'; children: ReactNode }) {
  return (
    <div className={`alerte alerte-${ton}`} role={ton === 'erreur' ? 'alert' : 'status'}>
      {children}
    </div>
  )
}

export function Chargement({ label }: { label: string }) {
  return (
    <div className="chargement" role="status" aria-live="polite">
      <span className="chargement-barre" />
      <span className="chargement-barre" />
      <span className="chargement-barre" />
      <p>{label}</p>
    </div>
  )
}

export function EtatVide({ titre, detail, action }: { titre: string; detail: string; action?: ReactNode }) {
  return (
    <div className="etat-vide">
      <h2>{titre}</h2>
      <p>{detail}</p>
      {action}
    </div>
  )
}
