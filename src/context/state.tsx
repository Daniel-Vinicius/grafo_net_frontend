import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import * as authService from '../services/AuthService'
import type { AuthUser } from '../services/AuthService'
import { AuthContext } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialToken] = useState(authService.hasSessionToken)
  const busy = useRef(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(initialToken)
  const [sessionPending, setSessionPending] = useState(initialToken)
  const [error, setError] = useState<string | null>(null)
  const clearSession = useCallback(() => {
    authService.clearSessionToken(); setUser(null); setSessionPending(false); setError(null)
  }, [])
  const acceptSession = useCallback((user: AuthUser) => {
    setUser(user); setSessionPending(false); setError(null)
  }, [])
  const runRequest = useCallback(async (action: () => Promise<void>, failure: string, protectedRequest = false) => {
    if (busy.current) return false
    busy.current = true; setLoading(true); setError(null)
    try { await action(); return true } catch (cause) {
      if (protectedRequest && cause instanceof authService.ApiError && cause.status === 401) {
        clearSession(); setError('Sessão inválida ou expirada. Entre novamente.')
      } else {
        setError(cause instanceof authService.ApiError && cause.status < 500 ? cause.message : failure)
      }
      return false
    } finally { busy.current = false; setLoading(false) }
  }, [clearSession])
  const refreshMe = useCallback(async () => {
    if (!authService.hasSessionToken()) return false
    return runRequest(async () => acceptSession(await authService.getCurrentUser()), 'Não foi possível consultar o usuário. Tente novamente.', true)
  }, [acceptSession, runRequest])
  const login = useCallback((email: string, password: string) => runRequest(async () => {
    acceptSession(await authService.login({ email, password }))
  }, 'Não foi possível entrar. Tente novamente.'), [acceptSession, runRequest])
  const logout = useCallback(async () => {
    if (!authService.hasSessionToken()) return false
    return runRequest(async () => {
      try { await authService.logout() } catch (cause) {
        if (!(cause instanceof authService.ApiError) || cause.status !== 401) throw cause
      }
      clearSession()
    }, 'Não foi possível confirmar o logout. Tente novamente.')
  }, [clearSession, runRequest])
  useEffect(() => {
    let active = true
    if (initialToken) void Promise.resolve().then(() => { if (active) void refreshMe() })
    return () => { active = false }
  }, [initialToken, refreshMe])
  return <AuthContext.Provider value={{ user, loading, error, sessionPending, login, logout, refreshMe, clearSession }}>{children}</AuthContext.Provider>
}
