import { STATUTS, type Demande, type Statut } from '../domain/demande'
import { peutTransitionner, motifTransitionRefusee } from '../domain/transitions'
import { champsDepuisZod, schemaCommentaire, schemaCreation } from '../domain/validation'

const demandes = new Map<string, Demande>()

function maintenant(): string {
  return new Date().toISOString()
}

function ajouter(partiel: Omit<Demande, 'dateMiseAJour'> & { dateMiseAJour?: string }): void {
  const date = partiel.dateCreation
  demandes.set(partiel.id, { ...partiel, dateMiseAJour: partiel.dateMiseAJour ?? date })
}

function semer(): void {
  if (demandes.size > 0) return
  const jour = (decalage: number) => new Date(Date.now() - decalage * 86_400_000).toISOString()
  ajouter({
    id: '6a1c1a10-1d2e-4b3c-8f01-000000000001',
    titre: 'Imprimante du 2e hors service',
    description: 'Le bac papier est bloqué depuis ce matin, personne ne peut imprimer.',
    categorie: 'Informatique',
    priorite: 'Haute',
    statut: 'Ouverte',
    auteur: 'Aina R.',
    commentaireResolution: null,
    dateCreation: jour(0),
  })
  ajouter({
    id: '6a1c1a10-1d2e-4b3c-8f01-000000000002',
    titre: 'Fuite sous le lavabo',
    description: 'De l’eau coule dans le placard de la kitchenette depuis une heure.',
    categorie: 'Locaux',
    priorite: 'Critique',
    statut: 'EnCours',
    auteur: 'Mialy R.',
    commentaireResolution: null,
    dateCreation: jour(1),
  })
  ajouter({
    id: '6a1c1a10-1d2e-4b3c-8f01-000000000003',
    titre: 'Badge d’accès refusé',
    description: 'Le badge de l’accueil ne déverrouille plus la porte latérale.',
    categorie: 'Informatique',
    priorite: 'Normale',
    statut: 'Ouverte',
    auteur: 'Hery A.',
    commentaireResolution: null,
    dateCreation: jour(1),
  })
  ajouter({
    id: '6a1c1a10-1d2e-4b3c-8f01-000000000004',
    titre: 'Néon du couloir qui clignote',
    description: 'Le tube du couloir nord clignote et gêne les réunions.',
    categorie: 'Locaux',
    priorite: 'Basse',
    statut: 'Ouverte',
    auteur: 'Soa P.',
    commentaireResolution: null,
    dateCreation: jour(2),
  })
  ajouter({
    id: '6a1c1a10-1d2e-4b3c-8f01-000000000005',
    titre: 'VPN inaccessible depuis chez soi',
    description: 'La connexion VPN échoue après l’authentification, message timeout.',
    categorie: 'Informatique',
    priorite: 'Haute',
    statut: 'Resolue',
    auteur: 'Tiana K.',
    commentaireResolution: 'Profil VPN recréé, connexion vérifiée avec l’utilisatrice.',
    dateCreation: jour(4),
    dateMiseAJour: jour(3),
  })
  ajouter({
    id: '6a1c1a10-1d2e-4b3c-8f01-000000000006',
    titre: 'Demande de plantes pour l’open space',
    description: 'Souhait de trois plantes pour le plateau, sans urgence particulière.',
    categorie: 'Autre',
    priorite: 'Basse',
    statut: 'Annulee',
    auteur: 'Lova M.',
    commentaireResolution: null,
    dateCreation: jour(6),
    dateMiseAJour: jour(5),
  })
  ajouter({
    id: '6a1c1a10-1d2e-4b3c-8f01-000000000007',
    titre: 'Climatisation salle de réunion A',
    description: 'La salle A reste à 28 degrés malgré le réglage au minimum.',
    categorie: 'Locaux',
    priorite: 'Normale',
    statut: 'EnCours',
    auteur: 'Nirina B.',
    commentaireResolution: null,
    dateCreation: jour(2),
  })
  ajouter({
    id: '6a1c1a10-1d2e-4b3c-8f01-000000000008',
    titre: 'Écran d’accueil figé',
    description: 'L’écran de la réception reste bloqué sur le logo depuis l’ouverture.',
    categorie: 'Informatique',
    priorite: 'Critique',
    statut: 'Ouverte',
    auteur: 'Fara S.',
    commentaireResolution: null,
    dateCreation: jour(0),
  })
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function probleme(status: number, titre: string, errors?: Record<string, string[]>, detail?: string): Response {
  return json(status, { title: titre, status, errors, detail })
}

function estStatut(valeur: unknown): valeur is Statut {
  return typeof valeur === 'string' && (STATUTS as readonly string[]).includes(valeur)
}

function liste(url: URL): Response {
  const statut = url.searchParams.get('statut')
  const priorite = url.searchParams.get('priorite')
  const recherche = (url.searchParams.get('recherche') ?? '').trim().toLowerCase()
  const resultat = [...demandes.values()]
    .filter((demande) => !statut || demande.statut === statut)
    .filter((demande) => !priorite || demande.priorite === priorite)
    .filter((demande) => !recherche || demande.titre.toLowerCase().includes(recherche))
    .sort((a, b) => b.dateCreation.localeCompare(a.dateCreation))
  return json(200, resultat)
}

function creer(body: unknown): Response {
  const parsed = schemaCreation.safeParse(body)
  if (!parsed.success) {
    const champs = champsDepuisZod(parsed.error)
    const errors = Object.fromEntries(Object.entries(champs).map(([cle, message]) => [cle, [message]]))
    return probleme(400, 'Certaines informations sont invalides.', errors)
  }
  const maintenantIso = maintenant()
  const demande: Demande = {
    id: crypto.randomUUID(),
    ...parsed.data,
    statut: 'Ouverte',
    commentaireResolution: null,
    dateCreation: maintenantIso,
    dateMiseAJour: maintenantIso,
  }
  demandes.set(demande.id, demande)
  return json(201, demande)
}

function changer(id: string, body: unknown): Response {
  const demande = demandes.get(id)
  if (!demande) return probleme(404, 'Introuvable', undefined, 'Cette demande est introuvable.')
  if (!estRecord(body) || !estStatut(body.statut)) {
    return probleme(400, 'Statut invalide.', { statut: ['Indiquez un statut connu.'] })
  }
  const vers = body.statut
  if (!peutTransitionner(demande.statut, vers)) {
    return probleme(409, 'Transition impossible', undefined, motifTransitionRefusee(demande.statut, vers))
  }
  let commentaire = demande.commentaireResolution
  if (vers === 'Resolue') {
    const texte = typeof body.commentaireResolution === 'string' ? body.commentaireResolution : ''
    const parsed = schemaCommentaire.safeParse(texte)
    if (!parsed.success) {
      return probleme(400, 'Commentaire insuffisant.', {
        commentaireResolution: [parsed.error.issues[0]?.message ?? 'Commentaire invalide.'],
      })
    }
    commentaire = parsed.data
  }
  const miseAJour: Demande = { ...demande, statut: vers, commentaireResolution: commentaire, dateMiseAJour: maintenant() }
  demandes.set(id, miseAJour)
  return json(200, miseAJour)
}

function estRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export async function mockRequest(path: string, init?: RequestInit): Promise<Response> {
  semer()
  const url = new URL(path, 'http://guichet.local')
  const method = (init?.method ?? 'GET').toUpperCase()
  const segments = url.pathname.split('/').filter(Boolean)

  if (segments[0] !== 'api' || segments[1] !== 'demandes') {
    return probleme(404, 'Route inconnue')
  }

  if (segments.length === 2 && method === 'GET') return liste(url)
  if (segments.length === 2 && method === 'POST') {
    return creer(init?.body ? JSON.parse(String(init.body)) : null)
  }

  const id = segments[2]
  if (!id) return probleme(404, 'Route inconnue')

  if (segments.length === 3 && method === 'GET') {
    const demande = demandes.get(id)
    return demande ? json(200, demande) : probleme(404, 'Introuvable', undefined, 'Cette demande est introuvable.')
  }

  if (segments.length === 4 && segments[3] === 'statut' && method === 'PATCH') {
    return changer(id, init?.body ? JSON.parse(String(init.body)) : null)
  }

  return probleme(404, 'Route inconnue')
}
