import { describe, expect, it } from 'vitest'
import { erreurDepuisReponse } from './errors'

describe('erreurDepuisReponse', () => {
  it('lit les erreurs de champ ASP.NET', () => {
    const erreur = erreurDepuisReponse(400, {
      title: 'Une ou plusieurs erreurs de validation sont survenues.',
      errors: { Titre: ['Le titre doit contenir entre 5 et 100 caractères.'] },
    })
    expect(erreur.type).toBe('validation')
    expect(erreur.champs.titre).toMatch(/5 et 100/)
  })

  it('distingue 404 et 409', () => {
    expect(erreurDepuisReponse(404, { detail: 'Introuvable' }).type).toBe('introuvable')
    const conflit = erreurDepuisReponse(409, { detail: 'Une demande résolue ne peut pas être rouverte.' })
    expect(conflit.type).toBe('conflit')
    expect(conflit.message).toMatch(/rouverte/)
  })
})
