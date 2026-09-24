export type TypeErreur = 'validation' | 'introuvable' | 'conflit' | 'reseau' | 'inconnue'

export class ApiError extends Error {
  readonly status: number
  readonly type: TypeErreur
  readonly champs: Record<string, string>

  constructor(status: number, type: TypeErreur, message: string, champs: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.type = type
    this.champs = champs
  }
}

function estRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normaliserCle(cle: string): string {
  const dernier = cle.split('.').at(-1) ?? cle
  const nu = dernier.startsWith('$.') ? dernier.slice(2) : dernier
  return nu.charAt(0).toLowerCase() + nu.slice(1)
}

function lireChamps(errors: unknown): Record<string, string> {
  if (!estRecord(errors)) return {}
  const champs: Record<string, string> = {}
  for (const [cle, valeur] of Object.entries(errors)) {
    const texte = Array.isArray(valeur) ? valeur.map(String).join(' ') : String(valeur ?? '')
    if (texte) champs[normaliserCle(cle)] = texte
  }
  return champs
}

function messageCorps(body: unknown): string {
  if (!estRecord(body)) return ''
  for (const cle of ['detail', 'message', 'title'] as const) {
    const valeur = body[cle]
    if (typeof valeur === 'string' && valeur.trim()) return valeur.trim()
  }
  return ''
}

export function erreurDepuisReponse(status: number, body: unknown): ApiError {
  const champs = estRecord(body) ? lireChamps(body.errors) : {}
  const messageApi = messageCorps(body)
  const premierChamp = Object.values(champs)[0]

  if (status === 404) {
    return new ApiError(status, 'introuvable', messageApi || 'Cette demande est introuvable.')
  }
  if (status === 409) {
    return new ApiError(status, 'conflit', messageApi || 'Cette transition n’est pas autorisée.')
  }
  if (status === 400) {
    return new ApiError(
      status,
      'validation',
      messageApi || premierChamp || 'Certaines informations sont invalides.',
      champs,
    )
  }
  return new ApiError(status, 'inconnue', messageApi || 'L’API a renvoyé une erreur inattendue.')
}

export function erreurReseau(): ApiError {
  return new ApiError(0, 'reseau', 'Impossible de joindre l’API. Vérifiez qu’elle est démarrée, puis réessayez.')
}

export function estApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
