import { describe, expect, it } from 'vitest'
import { motifTransitionRefusee, peutTransitionner, transitionsDepuis } from './transitions'

describe('transitions', () => {
  it('autorise le parcours nominal', () => {
    expect(peutTransitionner('Ouverte', 'EnCours')).toBe(true)
    expect(peutTransitionner('Ouverte', 'Annulee')).toBe(true)
    expect(peutTransitionner('EnCours', 'Resolue')).toBe(true)
    expect(peutTransitionner('EnCours', 'Annulee')).toBe(true)
  })

  it('bloque les statuts terminaux et les sauts', () => {
    expect(peutTransitionner('Resolue', 'Ouverte')).toBe(false)
    expect(peutTransitionner('Annulee', 'EnCours')).toBe(false)
    expect(peutTransitionner('Ouverte', 'Resolue')).toBe(false)
    expect(transitionsDepuis('Resolue')).toEqual([])
  })

  it('explique un refus', () => {
    expect(motifTransitionRefusee('Resolue', 'Ouverte')).toMatch(/close/)
    expect(motifTransitionRefusee('Ouverte', 'EnCours')).toBe('')
  })
})
