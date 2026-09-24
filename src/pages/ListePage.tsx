import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { demandeKeys, listerDemandes } from '../api/demandes'
import { estApiError } from '../api/errors'
import { BadgePriorite, BadgeStatut } from '../components/Badges'
import { Alerte, Chargement, EtatVide } from '../components/Feedback'
import { LIBELLES_STATUT, PRIORITES, STATUTS } from '../domain/demande'
import { formaterDate } from '../lib/dates'
import { useDebouncedValue, useDocumentTitle } from '../lib/hooks'

function lireEnum<T extends string>(valeur: string | null, valeurs: readonly T[]): T | undefined {
  if (!valeur) return undefined
  return valeurs.find((item) => item === valeur)
}

export function ListePage() {
  useDocumentTitle('Demandes')
  const [params, setParams] = useSearchParams()
  const statut = lireEnum(params.get('statut'), STATUTS)
  const priorite = lireEnum(params.get('priorite'), PRIORITES)
  const [rechercheSaisie, setRechercheSaisie] = useState(() => params.get('recherche') ?? '')
  const recherche = useDebouncedValue(rechercheSaisie.trim(), 300)

  useEffect(() => {
    setParams(
      (courant) => {
        const actuel = courant.get('recherche') ?? ''
        if (actuel === recherche) return courant
        const next = new URLSearchParams(courant)
        if (recherche) next.set('recherche', recherche)
        else next.delete('recherche')
        return next
      },
      { replace: true },
    )
  }, [recherche, setParams])

  const filtres = useMemo(
    () => ({ statut, priorite, recherche: recherche || undefined }),
    [statut, priorite, recherche],
  )

  const query = useQuery({
    queryKey: demandeKeys.list(filtres),
    queryFn: () => listerDemandes(filtres),
  })

  function changerFiltre(cle: 'statut' | 'priorite', valeur: string) {
    setParams(
      (courant) => {
        const next = new URLSearchParams(courant)
        if (valeur) next.set(cle, valeur)
        else next.delete(cle)
        return next
      },
      { replace: true },
    )
  }

  function effacer() {
    setRechercheSaisie('')
    setParams(new URLSearchParams(), { replace: true })
  }

  const filtresActifs = Boolean(statut || priorite || rechercheSaisie.trim())
  const demandes = query.data ?? []

  return (
    <section className="page">
      <header className="page-entete">
        <div>
          <h1>Demandes</h1>
          <p className="page-resume">
            {query.isSuccess
              ? `${demandes.length} demande${demandes.length > 1 ? 's' : ''}`
              : 'Suivi des interventions internes'}
          </p>
        </div>
      </header>

      <form className="filtres" onSubmit={(event) => event.preventDefault()}>
        <label>
          Statut
          <select value={statut ?? ''} onChange={(event) => changerFiltre('statut', event.target.value)}>
            <option value="">Tous</option>
            {STATUTS.map((valeur) => (
              <option key={valeur} value={valeur}>
                {LIBELLES_STATUT[valeur]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Priorité
          <select value={priorite ?? ''} onChange={(event) => changerFiltre('priorite', event.target.value)}>
            <option value="">Toutes</option>
            {PRIORITES.map((valeur) => (
              <option key={valeur} value={valeur}>
                {valeur}
              </option>
            ))}
          </select>
        </label>
        <label className="filtre-recherche">
          Recherche dans le titre
          <input
            type="search"
            value={rechercheSaisie}
            placeholder="Ex. imprimante"
            onChange={(event) => setRechercheSaisie(event.target.value)}
          />
        </label>
        {filtresActifs ? (
          <button type="button" className="bouton bouton-texte" onClick={effacer}>
            Effacer les filtres
          </button>
        ) : null}
      </form>

      {query.isPending ? <Chargement label="Chargement des demandes…" /> : null}
      {query.isError ? (
        <Alerte ton="erreur">
          <p>{estApiError(query.error) ? query.error.message : 'Le chargement a échoué.'}</p>
          <button type="button" className="bouton" onClick={() => void query.refetch()}>
            Réessayer
          </button>
        </Alerte>
      ) : null}

      {query.isSuccess && demandes.length === 0 ? (
        <EtatVide
          titre={filtresActifs ? 'Aucune demande ne correspond' : 'Aucune demande pour le moment'}
          detail={
            filtresActifs
              ? 'Modifiez les filtres ou effacez-les pour revoir l’ensemble.'
              : 'Créez la première demande d’intervention.'
          }
          action={
            filtresActifs ? (
              <button type="button" className="bouton" onClick={effacer}>
                Effacer les filtres
              </button>
            ) : (
              <Link className="bouton bouton-primaire" to="/demandes/nouvelle">
                Nouvelle demande
              </Link>
            )
          }
        />
      ) : null}

      {query.isSuccess && demandes.length > 0 ? (
        <div className="liste" aria-live="polite">
          <table>
            <thead>
              <tr>
                <th>Titre</th>
                <th>Catégorie</th>
                <th>Priorité</th>
                <th>Statut</th>
                <th>Auteur</th>
                <th>Créée</th>
              </tr>
            </thead>
            <tbody>
              {demandes.map((demande) => (
                <tr key={demande.id} className={`ligne ligne-${demande.priorite}`}>
                  <td data-label="Titre">
                    <Link to={`/demandes/${demande.id}`}>{demande.titre}</Link>
                  </td>
                  <td data-label="Catégorie">{demande.categorie}</td>
                  <td data-label="Priorité">
                    <BadgePriorite priorite={demande.priorite} />
                  </td>
                  <td data-label="Statut">
                    <BadgeStatut statut={demande.statut} />
                  </td>
                  <td data-label="Auteur">{demande.auteur}</td>
                  <td data-label="Créée">{formaterDate(demande.dateCreation)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}
