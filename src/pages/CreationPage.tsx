import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { creerDemande, demandeKeys } from '../api/demandes'
import { estApiError } from '../api/errors'
import { Field } from '../components/Field'
import { Alerte } from '../components/Feedback'
import { CATEGORIES, PRIORITES, type Categorie, type Priorite } from '../domain/demande'
import { champsDepuisZod, schemaCreation, type ChampsFormulaire } from '../domain/validation'
import { useDocumentTitle } from '../lib/hooks'

const VIDE = {
  titre: '',
  description: '',
  categorie: '' as Categorie | '',
  priorite: 'Normale' as Priorite | '',
  auteur: '',
}

export function CreationPage() {
  useDocumentTitle('Nouvelle demande')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [valeurs, setValeurs] = useState(VIDE)
  const [champs, setChamps] = useState<ChampsFormulaire>({})
  const [message, setMessage] = useState('')

  const mutation = useMutation({
    mutationFn: creerDemande,
    onSuccess: async (demande) => {
      await queryClient.invalidateQueries({ queryKey: demandeKeys.all })
      navigate(`/demandes/${demande.id}`)
    },
    onError: (error) => {
      if (!estApiError(error)) {
        setMessage('La création a échoué.')
        return
      }
      setChamps(error.champs)
      setMessage(error.type === 'validation' ? '' : error.message)
    },
  })

  function changer<K extends keyof typeof VIDE>(cle: K, valeur: (typeof VIDE)[K]) {
    setValeurs((courant) => ({ ...courant, [cle]: valeur }))
    setChamps((courant) => {
      if (!courant[cle]) return courant
      const suivant = { ...courant }
      delete suivant[cle]
      return suivant
    })
  }

  function soumettre(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    const parsed = schemaCreation.safeParse(valeurs)
    if (!parsed.success) {
      setChamps(champsDepuisZod(parsed.error))
      return
    }
    setChamps({})
    mutation.mutate(parsed.data)
  }

  return (
    <section className="page page-etroite">
      <header className="page-entete">
        <div>
          <p className="fil">
            <Link to="/">Demandes</Link>
          </p>
          <h1>Nouvelle demande</h1>
          <p className="page-resume">Décrivez l’intervention. Le statut et les dates sont posés par le serveur.</p>
        </div>
      </header>

      {message ? <Alerte ton="erreur">{message}</Alerte> : null}

      <form className="carte formulaire" onSubmit={soumettre} noValidate>
        <Field id="titre" label="Titre" erreur={champs.titre} hint={`${valeurs.titre.trim().length}/100`}>
          <input
            value={valeurs.titre}
            maxLength={100}
            required
            onChange={(event) => changer('titre', event.target.value)}
          />
        </Field>
        <Field
          id="description"
          label="Description"
          erreur={champs.description}
          hint={`${valeurs.description.trim().length}/2000`}
        >
          <textarea
            value={valeurs.description}
            rows={6}
            maxLength={2000}
            required
            onChange={(event) => changer('description', event.target.value)}
          />
        </Field>
        <div className="grille-2">
          <Field id="categorie" label="Catégorie" erreur={champs.categorie}>
            <select
              value={valeurs.categorie}
              required
              onChange={(event) => changer('categorie', event.target.value as Categorie | '')}
            >
              <option value="">Choisir…</option>
              {CATEGORIES.map((valeur) => (
                <option key={valeur} value={valeur}>
                  {valeur}
                </option>
              ))}
            </select>
          </Field>
          <Field id="priorite" label="Priorité" erreur={champs.priorite}>
            <select
              value={valeurs.priorite}
              required
              onChange={(event) => changer('priorite', event.target.value as Priorite)}
            >
              {PRIORITES.map((valeur) => (
                <option key={valeur} value={valeur}>
                  {valeur}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field id="auteur" label="Auteur" erreur={champs.auteur}>
          <input
            value={valeurs.auteur}
            maxLength={80}
            required
            autoComplete="name"
            onChange={(event) => changer('auteur', event.target.value)}
          />
        </Field>
        <div className="actions">
          <button type="submit" className="bouton bouton-primaire" disabled={mutation.isPending}>
            {mutation.isPending ? 'Enregistrement…' : 'Créer la demande'}
          </button>
          <Link className="bouton" to="/">
            Annuler
          </Link>
        </div>
      </form>
    </section>
  )
}
