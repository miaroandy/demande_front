import type { Priorite, Statut } from '../domain/demande'
import { LIBELLES_STATUT } from '../domain/demande'

export function BadgeStatut({ statut }: { statut: Statut }) {
  return <span className={`badge badge-statut badge-${statut}`}>{LIBELLES_STATUT[statut]}</span>
}

export function BadgePriorite({ priorite }: { priorite: Priorite }) {
  return <span className={`badge badge-priorite badge-${priorite}`}>{priorite}</span>
}
