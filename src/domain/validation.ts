import { z } from 'zod'
import { CATEGORIES, PRIORITES } from './demande'

export const MIN_COMMENTAIRE = 10

export const schemaCreation = z.object({
  titre: z
    .string()
    .trim()
    .min(5, 'Le titre doit contenir entre 5 et 100 caractères.')
    .max(100, 'Le titre doit contenir entre 5 et 100 caractères.'),
  description: z
    .string()
    .trim()
    .min(10, 'La description doit contenir entre 10 et 2 000 caractères.')
    .max(2000, 'La description doit contenir entre 10 et 2 000 caractères.'),
  categorie: z.enum(CATEGORIES, { error: 'Choisissez une catégorie.' }),
  priorite: z.enum(PRIORITES, { error: 'Choisissez une priorité.' }),
  auteur: z
    .string()
    .trim()
    .min(2, 'L’auteur doit contenir entre 2 et 80 caractères.')
    .max(80, 'L’auteur doit contenir entre 2 et 80 caractères.'),
})

export const schemaCommentaire = z
  .string()
  .trim()
  .min(MIN_COMMENTAIRE, 'Le commentaire de résolution doit contenir au moins 10 caractères.')

export type ChampsFormulaire = Record<string, string>

export function champsDepuisZod(error: z.ZodError): ChampsFormulaire {
  const champs: ChampsFormulaire = {}
  for (const issue of error.issues) {
    const cle = String(issue.path[0] ?? '')
    if (cle && !champs[cle]) champs[cle] = issue.message
  }
  return champs
}
