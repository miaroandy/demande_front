import { z } from 'zod'
import { CATEGORIES, PRIORITES, STATUTS, type Demande, type FiltresDemandes, type NouvelleDemande, type Statut } from '../domain/demande'
import { lireJson } from './http'

export const demandeSchema = z.object({
  id: z.string(),
  titre: z.string(),
  description: z.string(),
  categorie: z.enum(CATEGORIES),
  priorite: z.enum(PRIORITES),
  statut: z.enum(STATUTS),
  auteur: z.string(),
  commentaireResolution: z
    .string()
    .nullable()
    .optional()
    .transform((valeur) => (valeur && valeur.trim() ? valeur : null)),
  dateCreation: z.string(),
  dateMiseAJour: z.string(),
})

const listeSchema = z.array(demandeSchema)

export const demandeKeys = {
  all: ['demandes'] as const,
  list: (filtres: FiltresDemandes) => [...demandeKeys.all, 'list', filtres] as const,
  detail: (id: string) => [...demandeKeys.all, 'detail', id] as const,
}

function queryFiltres(filtres: FiltresDemandes): string {
  const params = new URLSearchParams()
  if (filtres.statut) params.set('statut', filtres.statut)
  if (filtres.priorite) params.set('priorite', filtres.priorite)
  if (filtres.recherche) params.set('recherche', filtres.recherche)
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function listerDemandes(filtres: FiltresDemandes): Promise<Demande[]> {
  return lireJson(`/api/demandes${queryFiltres(filtres)}`, listeSchema)
}

export function lireDemande(id: string): Promise<Demande> {
  return lireJson(`/api/demandes/${id}`, demandeSchema)
}

export function creerDemande(saisie: NouvelleDemande): Promise<Demande> {
  return lireJson('/api/demandes', demandeSchema, {
    method: 'POST',
    body: JSON.stringify(saisie),
  })
}

export function changerStatut(id: string, statut: Statut, commentaireResolution?: string): Promise<Demande> {
  const corps: { statut: Statut; commentaireResolution?: string } = { statut }
  if (statut === 'Resolue') corps.commentaireResolution = commentaireResolution ?? ''
  return lireJson(`/api/demandes/${id}/statut`, demandeSchema, {
    method: 'PATCH',
    body: JSON.stringify(corps),
  })
}
