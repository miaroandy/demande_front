import { z } from 'zod'
import { ApiError, erreurDepuisReponse, erreurReseau } from './errors'
import { mockRequest } from '../mocks/memoryApi'

async function envoyer(path: string, init?: RequestInit): Promise<Response> {
  if (import.meta.env.VITE_USE_MOCK === 'true') return mockRequest(path, init)

  const base = import.meta.env.VITE_API_URL ?? ''
  const headers = new Headers(init?.headers)
  headers.set('Accept', 'application/json')
  if (init?.body) headers.set('Content-Type', 'application/json')

  try {
    return await fetch(`${base}${path}`, { ...init, headers })
  } catch (error) {
    if (error instanceof TypeError) throw erreurReseau()
    throw error
  }
}

export async function lireJson<T>(path: string, schema: z.ZodType<T>, init?: RequestInit): Promise<T> {
  const response = await envoyer(path, init)
  const texte = await response.text()
  const body: unknown = texte ? JSON.parse(texte) : null

  if (!response.ok) throw erreurDepuisReponse(response.status, body)

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw new ApiError(response.status, 'inconnue', 'La réponse de l’API n’a pas le format attendu.')
  }
  return parsed.data
}
