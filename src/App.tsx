import { useCallback, useState } from 'react'
import { BrowserRouter, useNavigate } from 'react-router'
import AuthPage from './pages/AuthPage'
import ProfileWorkspace from './modules/auth/components/ProfileWorkspace'
import { clearSessionToken, type AuthUser } from './services/AuthService'
import './App.css'

function SessionApp() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const navigate = useNavigate()
  const endSession = useCallback((message: string) => {
    clearSessionToken(); setUser(null); setNotice(message); navigate('/login', { replace: true })
  }, [navigate])
  return user ? <ProfileWorkspace user={user} onSessionEnd={endSession} /> : <AuthPage notice={notice} onAuthenticated={next => {
    setNotice(null); setUser(next); navigate('/', { replace: true })
  }} />
}
export default function App() {
  return <BrowserRouter><SessionApp /></BrowserRouter>
}
