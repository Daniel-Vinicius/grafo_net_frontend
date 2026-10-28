import type { AxiosRequestConfig } from 'axios'
import { ApiError, clearSessionToken, getAccessToken, login as signIn } from './AuthService'
import { apiRequest } from './apiClient'
export type { AuthUser as User } from './AuthService'

export class HttpError extends ApiError {
  constructor(status: number, message: string) {
    super(message, status)
  }
}

async function request<T = unknown>(path: string, config?: AxiosRequestConfig) {
  try {
    return await apiRequest<T>(path, config)
  } catch (error) {
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
  return request('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
}

export async function logout(token: string): Promise<void> {
  await request('/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
  if (getAccessToken() === token) clearSessionToken()
}

export async function verificarHealth() {
  return request('/health')
}
