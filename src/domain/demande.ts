export const CATEGORIES = ['Informatique', 'Locaux', 'Autre'] as const
export const PRIORITES = ['Basse', 'Normale', 'Haute', 'Critique'] as const
export const STATUTS = ['Ouverte', 'EnCours', 'Resolue', 'Annulee'] as const

export type Categorie = (typeof CATEGORIES)[number]
export type Priorite = (typeof PRIORITES)[number]
export type Statut = (typeof STATUTS)[number]

export type Demande = {
  id: string
  titre: string
  description: string
  categorie: Categorie
  priorite: Priorite
  statut: Statut
  auteur: string
  commentaireResolution: string | null
  dateCreation: string
  dateMiseAJour: string
}

export type NouvelleDemande = {
  titre: string
  description: string
  categorie: Categorie
  priorite: Priorite
  auteur: string
}

export type FiltresDemandes = {
  statut?: Statut
  priorite?: Priorite
  recherche?: string
}

export const LIBELLES_STATUT: Record<Statut, string> = {
  Ouverte: 'Ouverte',
  EnCours: 'En cours',
  Resolue: 'Résolue',
  Annulee: 'Annulée',
}

export const LIBELLES_ACTION: Record<Statut, string> = {
  Ouverte: 'Rouvrir',
  EnCours: 'Prendre en charge',
  Resolue: 'Résoudre',
  Annulee: 'Annuler la demande',
}
