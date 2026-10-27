import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import * as authService from '../services/GrafonetService'
import type { User } from '../services/GrafonetService'
import { AuthContext } from './authContext'

const TOKEN_KEY = 'grafonet.access_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const token = useRef(initialToken)
  const busy = useRef(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(Boolean(initialToken))
  const [sessionPending, setSessionPending] = useState(Boolean(initialToken))
  const [error, setError] = useState<string | null>(null)

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    token.current = null
    setUser(null)
    setSessionPending(false)
  }, [])

  const runRequest = useCallback(async (
    action: () => Promise<void>,
    failureMessage: string,
    protectedRequest = false,
  ) => {
    if (busy.current) return false

    busy.current = true
    setLoading(true)
    setError(null)

    try {
      await action()
      return true
    } catch (cause) {
      if (protectedRequest && cause instanceof authService.HttpError && cause.status === 401) {
        clearSession()
        setError('Sessão inválida ou expirada. Entre novamente.')
      } else {
        const detail = cause instanceof authService.HttpError && cause.status < 500
          ? ` ${cause.message}`
          : ''
        setError(`${failureMessage}${detail}`)
      }
      return false
    } finally {
      busy.current = false
      setLoading(false)
    }
  }, [clearSession])

  const refreshMe = useCallback(async () => {
    const accessToken = token.current
    if (!accessToken) return false

    return runRequest(async () => {
      const currentUser = await authService.getMe(accessToken)
      setUser(currentUser)
      setSessionPending(false)
    }, 'Não foi possível consultar o usuário. Tente novamente.', true)
  }, [runRequest])

  const login = useCallback((email: string, password: string) => runRequest(async () => {
    const session = await authService.login(email, password)
    localStorage.setItem(TOKEN_KEY, session.access_token)
    token.current = session.access_token
    setUser(session.user)
    setSessionPending(false)
  }, 'Não foi possível entrar. Tente novamente.'), [runRequest])

  const logout = useCallback(async () => {
    const accessToken = token.current
    if (!accessToken) return false

    return runRequest(async () => {
      try {
        await authService.logout(accessToken)
      } catch (cause) {
        if (!(cause instanceof authService.HttpError) || cause.status !== 401) throw cause
      }
      clearSession()
    }, 'Não foi possível confirmar o logout. Tente novamente.')
  }, [clearSession, runRequest])

  useEffect(() => {
    if (initialToken) void refreshMe()
  }, [initialToken, refreshMe])

  return (
    <AuthContext.Provider value={{ user, loading, error, sessionPending, login, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  )
}
