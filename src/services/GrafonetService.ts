// Compatibilidade para consumidores da main: usa a mesma sessão e transporte do perfil.
import { ApiError, authenticatedFetch, getAccessToken, login as signIn } from './AuthService'
export type { AuthUser as User } from './AuthService'

export class HttpError extends ApiError {
  constructor(status: number, message: string) { super(message, status) }
}
async function request(path: string, options?: RequestInit) {
  try { return await authenticatedFetch(path, options) } catch (error) {
    if (error instanceof ApiError) throw new HttpError(error.status, error.message)
    throw error
  }
}
export async function login(email: string, password: string) {
  try {
    const user = await signIn({ email, password })
    return { access_token: getAccessToken()!, user }
  } catch (error) {
    if (error instanceof ApiError) throw new HttpError(error.status, error.message)
    throw error
  }
}
export async function getMe(token: string) {
  return (await request('/auth/me', { headers: { Authorization: `Bearer ${token}` } })).json()
}
export async function logout(token: string): Promise<void> {
  await request('/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
  const { clearSessionToken } = await import('./AuthService')
  if (getAccessToken() === token) clearSessionToken()
}
export async function verificarHealth() { return (await request('/health')).json() }
