import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { changerStatut, demandeKeys, lireDemande } from '../api/demandes'
import { estApiError } from '../api/errors'
import { BadgePriorite, BadgeStatut } from '../components/Badges'
import { Dialog } from '../components/Dialog'
import { Field } from '../components/Field'
import { Alerte, Chargement } from '../components/Feedback'
import { LIBELLES_ACTION, LIBELLES_STATUT, type Statut } from '../domain/demande'
import { transitionsDepuis } from '../domain/transitions'
import { schemaCommentaire } from '../domain/validation'
import { formaterDate } from '../lib/dates'
import { useDocumentTitle } from '../lib/hooks'

export function DetailPage() {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: demandeKeys.detail(id),
    queryFn: () => lireDemande(id),
    enabled: Boolean(id),
  })
  const demande = query.data
  useDocumentTitle(demande?.titre ?? 'Demande')

  const [commentaire, setCommentaire] = useState('')
  const [erreurCommentaire, setErreurCommentaire] = useState('')
  const [message, setMessage] = useState('')
  const [confirmerAnnulation, setConfirmerAnnulation] = useState(false)

  const mutation = useMutation({
    mutationFn: (cible: { statut: Statut; commentaireResolution?: string }) =>
      changerStatut(id, cible.statut, cible.commentaireResolution),
    onSuccess: async (miseAJour) => {
      setMessage(`Statut mis à jour : ${LIBELLES_STATUT[miseAJour.statut]}.`)
      setCommentaire('')
      setErreurCommentaire('')
      setConfirmerAnnulation(false)
      queryClient.setQueryData(demandeKeys.detail(id), miseAJour)
      await queryClient.invalidateQueries({ queryKey: demandeKeys.all })
    },
    onError: (error) => {
      setConfirmerAnnulation(false)
      if (!estApiError(error)) {
        setMessage('La mise à jour a échoué.')
        return
      }
      if (error.champs.commentaireResolution) setErreurCommentaire(error.champs.commentaireResolution)
      setMessage(error.message)
    },
  })

  function demander(statut: Statut) {
    setMessage('')
    if (statut === 'Annulee') {
      setConfirmerAnnulation(true)
      return
    }
    if (statut === 'Resolue') {
      const parsed = schemaCommentaire.safeParse(commentaire)
      if (!parsed.success) {
        setErreurCommentaire(parsed.error.issues[0]?.message ?? 'Commentaire invalide.')
        return
      }
      mutation.mutate({ statut, commentaireResolution: parsed.data })
      return
    }
    mutation.mutate({ statut })
  }

  if (query.isPending) return <Chargement label="Chargement de la demande…" />

  if (query.isError) {
    const introuvable = estApiError(query.error) && query.error.type === 'introuvable'
    return (
      <section className="page page-etroite">
        <Alerte ton="erreur">
          <p>{estApiError(query.error) ? query.error.message : 'Chargement impossible.'}</p>
        </Alerte>
        {introuvable ? null : (
          <button type="button" className="bouton" onClick={() => void query.refetch()}>
            Réessayer
          </button>
        )}
        <p>
          <Link to="/">Retour à la liste</Link>
        </p>
      </section>
    )
  }

  if (!demande) return null

  const actions = transitionsDepuis(demande.statut)
  const peutResoudre = actions.includes('Resolue')
  const autres = actions.filter((statut) => statut !== 'Resolue')

  return (
    <section className="page">
      <header className="page-entete">
        <div>
          <p className="fil">
            <Link to="/">Demandes</Link>
          </p>
          <h1>{demande.titre}</h1>
          <p className="page-resume">
            Ouverte par {demande.auteur} le {formaterDate(demande.dateCreation)}
          </p>
        </div>
        <div className="entete-badges">
          <BadgeStatut statut={demande.statut} />
          <BadgePriorite priorite={demande.priorite} />
        </div>
      </header>

      {message ? <Alerte ton={message.startsWith('Statut') ? 'succes' : 'erreur'}>{message}</Alerte> : null}

      <div className="detail">
        <article className="carte">
          <dl className="meta">
            <div>
              <dt>Catégorie</dt>
              <dd>{demande.categorie}</dd>
            </div>
            <div>
              <dt>Mise à jour</dt>
              <dd>{formaterDate(demande.dateMiseAJour)}</dd>
            </div>
          </dl>
          <h2>Description</h2>
          <p className="description">{demande.description}</p>
          {demande.commentaireResolution ? (
            <>
              <h2>Résolution</h2>
              <p className="description">{demande.commentaireResolution}</p>
            </>
          ) : null}
        </article>

        <aside className="carte panneau">
          <h2>Suite à donner</h2>
          {actions.length === 0 ? (
            <p>Cette demande est close. Aucune transition n’est possible.</p>
          ) : (
            <>
              {peutResoudre ? (
                <Field
                  id="commentaireResolution"
                  label="Commentaire de résolution"
                  erreur={erreurCommentaire}
                  hint="10 caractères minimum. Obligatoire pour clore la demande."
                >
                  <textarea
                    value={commentaire}
                    rows={5}
                    onChange={(event) => {
                      setCommentaire(event.target.value)
                      setErreurCommentaire('')
                    }}
                  />
                </Field>
              ) : null}
              <div className="actions actions-colonne">
                {peutResoudre ? (
                  <button
                    type="button"
                    className="bouton bouton-primaire"
                    disabled={mutation.isPending}
                    onClick={() => demander('Resolue')}
                  >
                    {LIBELLES_ACTION.Resolue}
                  </button>
                ) : null}
                {autres.map((statut) => (
                  <button
                    key={statut}
                    type="button"
                    className={statut === 'Annulee' ? 'bouton bouton-danger' : 'bouton bouton-primaire'}
                    disabled={mutation.isPending}
                    onClick={() => demander(statut)}
                  >
                    {LIBELLES_ACTION[statut]}
                  </button>
                ))}
              </div>
            </>
          )}
        </aside>
      </div>

      {confirmerAnnulation ? (
        <Dialog titre="Annuler cette demande ?" onFermer={() => setConfirmerAnnulation(false)}>
          <p>La demande sera close. Cette action est définitive.</p>
          <div className="actions">
            <button type="button" className="bouton" onClick={() => setConfirmerAnnulation(false)}>
              Retour
            </button>
            <button
              type="button"
              className="bouton bouton-danger"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate({ statut: 'Annulee' })}
            >
              Confirmer l’annulation
            </button>
          </div>
        </Dialog>
      ) : null}
    </section>
  )
}
