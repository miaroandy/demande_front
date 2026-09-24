import type { Statut } from './demande'

const SUIVANTS: Record<Statut, readonly Statut[]> = {
  Ouverte: ['EnCours', 'Annulee'],
  EnCours: ['Resolue', 'Annulee'],
  Resolue: [],
  Annulee: [],
}

export function transitionsDepuis(statut: Statut): readonly Statut[] {
  return SUIVANTS[statut]
}

export function peutTransitionner(depuis: Statut, vers: Statut): boolean {
  return SUIVANTS[depuis].includes(vers)
}

export function motifTransitionRefusee(depuis: Statut, vers: Statut): string {
  if (peutTransitionner(depuis, vers)) return ''
  if (depuis === 'Resolue' || depuis === 'Annulee') {
    return 'Cette demande est close. Aucune transition n’est possible.'
  }
  return `Le passage de « ${depuis} » à « ${vers} » n’est pas autorisé.`
}
