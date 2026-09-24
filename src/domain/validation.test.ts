import { describe, expect, it } from 'vitest'
import { champsDepuisZod, schemaCommentaire, schemaCreation } from './validation'

const valide = {
  titre: 'Imprimante hors service',
  description: 'Le bac papier est bloqué depuis ce matin.',
  categorie: 'Informatique',
  priorite: 'Haute',
  auteur: 'Aina R.',
}

describe('schemaCreation', () => {
  it('accepte une demande valide', () => {
    expect(schemaCreation.safeParse(valide).success).toBe(true)
  })

  it('refuse un titre trop court et nomme le champ', () => {
    const result = schemaCreation.safeParse({ ...valide, titre: 'AB' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(champsDepuisZod(result.error).titre).toMatch(/5 et 100/)
    }
  })
})

describe('schemaCommentaire', () => {
  it('exige 10 caractères', () => {
    expect(schemaCommentaire.safeParse('court').success).toBe(false)
    expect(schemaCommentaire.safeParse('Joint remplacé et testé.').success).toBe(true)
  })
})
