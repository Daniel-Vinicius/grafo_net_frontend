export interface User {
  id: string
  email: string
}

interface LoginResponse {
  access_token: string
  user: User
}

export class HttpError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request(path: string, options?: RequestInit) {
  const resposta = await fetch(path, {
    ...options,
    signal: AbortSignal.timeout(10_000),
  })

  if (!resposta.ok) {
    const dados = await resposta.json().catch(() => null)
    const message = typeof dados?.message === 'string'
      ? dados.message
      : `Erro HTTP ${resposta.status}`

    throw new HttpError(resposta.status, message)
  }

  return resposta
}

function authorization(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const resposta = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  return resposta.json()
}

export async function getMe(token: string): Promise<User> {
  const resposta = await request('/auth/me', { headers: authorization(token) })
  return resposta.json()
}

export async function logout(token: string): Promise<void> {
  await request('/auth/logout', {
    method: 'POST',
    headers: authorization(token),
  })
}

export async function verificarHealth() {
  const resposta = await request('/health')
  return resposta.json()
}
