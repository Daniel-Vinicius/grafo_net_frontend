export interface AuthCredentials {
  email: string
  password: string
}

export interface RegistrationCredentials extends AuthCredentials {
  profile: import('../modules/auth/types').ProfileInput
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

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

let accessToken: string | null = null

export function hasSessionToken(): boolean {
  return accessToken !== null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

export async function authenticatedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(path, { ...init, headers })
  if (!response.ok) {
    const body = await readResponseBody(response)
    const message =
      isRecord(body) && typeof body.message === 'string'
        ? body.message
        : `A API respondeu com erro (${response.status}).`
    throw new ApiError(message, response.status)
  }

  return response
}

export async function request(path: string, init: RequestInit = {}): Promise<unknown> {
  return readResponseBody(await authenticatedFetch(path, init))
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
  const body = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })

  if (
    !isRecord(body) ||
    typeof body.access_token !== 'string' ||
    body.access_token.length === 0
  ) {
    throw new Error('A API não retornou um token de autenticação válido.')
  }

  const user = parseUser(body.user)
  accessToken = body.access_token
  return user
}

export async function register(
  credentials: RegistrationCredentials,
): Promise<AuthUser> {
  const body = await request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })

  return parseUser(body)
}

export async function getCurrentUser(): Promise<AuthUser> {
  const body = await request('/api/auth/me')
  return parseUser(body)
}

export async function sendInvitation(email: string): Promise<Invitation> {
  const body = await request('/api/invitations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
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
  await request('/api/auth/logout', { method: 'POST' })
  accessToken = null
}

export function clearSessionToken(): void {
  accessToken = null
}
