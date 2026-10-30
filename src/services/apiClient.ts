import axios, { type AxiosRequestConfig } from 'axios'

const TOKEN_KEY = 'grafonet.access_token'

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearSessionToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10_000,
  headers: { Accept: 'application/json' },
})

apiClient.interceptors.request.use(config => {
  const accessToken = getAccessToken()
  if (accessToken && !config.headers.has('Authorization')) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }
  return config
})

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (axios.isAxiosError(error) && error.response) {
      const body: unknown = error.response.data
      const message =
        typeof body === 'object' &&
        body !== null &&
        'message' in body &&
        typeof body.message === 'string'
          ? body.message
          : `A API respondeu com erro (${error.response.status}).`
      return Promise.reject(new ApiError(message, error.response.status))
    }

    return Promise.reject(error)
  },
)

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return 'Não foi possível conectar à API. Verifique sua conexão e tente novamente.'
  }
  return error instanceof Error ? error.message : 'Não foi possível concluir a operação.'
}

export async function apiRequest<T = unknown>(
  url: string,
  config: AxiosRequestConfig = {},
): Promise<T> {
  const response = await apiClient.request<T>({ ...config, url })
  return response.data
}
