import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from '../app/App'

describe('parcours Guichet', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/')
  })

  it('liste, refuse une saisie trop courte, crée puis résout', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(await screen.findByRole('link', { name: 'Imprimante du 2e hors service' })).toBeTruthy()

    await user.selectOptions(screen.getByLabelText('Statut'), 'Resolue')
    expect(await screen.findByRole('link', { name: 'VPN inaccessible depuis chez soi' })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Imprimante du 2e hors service' })).toBeNull()

    await user.selectOptions(screen.getByLabelText('Statut'), '')
    await user.click(screen.getByRole('link', { name: 'Nouvelle demande' }))

    await user.type(screen.getByLabelText('Titre'), 'Ab')
    await user.type(screen.getByLabelText('Description'), 'Description assez longue pour passer.')
    await user.selectOptions(screen.getByLabelText('Catégorie'), 'Locaux')
    await user.type(screen.getByLabelText('Auteur'), 'Nina')
    await user.click(screen.getByRole('button', { name: 'Créer la demande' }))
    expect(await screen.findByText(/entre 5 et 100/)).toBeTruthy()

    await user.clear(screen.getByLabelText('Titre'))
    await user.type(screen.getByLabelText('Titre'), 'Porte vitrée fêlée')
    await user.click(screen.getByRole('button', { name: 'Créer la demande' }))

    expect(await screen.findByRole('heading', { name: 'Porte vitrée fêlée' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Prendre en charge' }))
    expect(await screen.findByText('Statut mis à jour : En cours.')).toBeTruthy()

    await user.type(screen.getByLabelText('Commentaire de résolution'), 'court')
    await user.click(screen.getByRole('button', { name: 'Résoudre' }))
    expect(await screen.findByText(/au moins 10 caractères/)).toBeTruthy()

    await user.clear(screen.getByLabelText('Commentaire de résolution'))
    await user.type(screen.getByLabelText('Commentaire de résolution'), 'Vitrage remplacé et passage vérifié.')
    await user.click(screen.getByRole('button', { name: 'Résoudre' }))
    expect(await screen.findByText('Cette demande est close. Aucune transition n’est possible.')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Prendre en charge' })).toBeNull()
  })
})
