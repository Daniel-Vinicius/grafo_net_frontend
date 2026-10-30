import { apiRequest, clearSessionToken, getAccessToken } from './apiClient'
export { ApiError, clearSessionToken, getAccessToken } from './apiClient'

export interface AuthCredentials {
  email: string
  password: string
}

export interface RegistrationCredentials extends AuthCredentials {
  profile: import('../types/profile').ProfileInput
  invite_token: string
}

export interface AuthUser {
  id: string
  email: string
}

export interface Invitation {
  id: string
  email: string
  expires_at: string
}

export function hasSessionToken(): boolean {
  return getAccessToken() !== null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseUser(value: unknown): AuthUser {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.email !== 'string'
  ) {
    throw new Error('A API retornou dados de usuário inválidos.')
  }

  return { id: value.id, email: value.email }
}

export async function login(credentials: AuthCredentials): Promise<AuthUser> {
  const body = await apiRequest<unknown>('/auth/login', {
    method: 'POST',
    data: credentials,
  })

  if (
    !isRecord(body) ||
    typeof body.access_token !== 'string' ||
    body.access_token.length === 0
  ) {
    throw new Error('A API não retornou um token de autenticação válido.')
  }

  const user = parseUser(body.user)
  localStorage.setItem('grafonet.access_token', body.access_token)
  return user
}

export async function register(
  credentials: RegistrationCredentials,
): Promise<AuthUser> {
  const body = await apiRequest<unknown>('/auth/register', {
    method: 'POST',
    data: credentials,
  })

  return parseUser(body)
}

export async function getCurrentUser(): Promise<AuthUser> {
  const body = await apiRequest<unknown>('/auth/me')
  return parseUser(body)
}

export async function sendInvitation(email: string): Promise<Invitation> {
  const body = await apiRequest<unknown>('/invitations', {
    method: 'POST',
    data: { email },
  })

  if (
    !isRecord(body) ||
    typeof body.id !== 'string' ||
    typeof body.email !== 'string' ||
    typeof body.expires_at !== 'string'
  ) {
    throw new Error('A API retornou dados de convite inválidos.')
  }

  return {
    id: body.id,
    email: body.email,
    expires_at: body.expires_at,
  }
}

export async function logout(): Promise<void> {
  await apiRequest('/auth/logout', { method: 'POST' })
  clearSessionToken()
}
