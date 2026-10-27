import { createContext, useContext } from 'react'
import type { User } from '../services/GrafonetService'

interface AuthContextValue {
  user: User | null
  loading: boolean
  error: string | null
  sessionPending: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<boolean>
  refreshMe: () => Promise<boolean>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.')
  }

  return context
}
