import { useCallback, useState } from 'react'
import { BrowserRouter, useNavigate } from 'react-router'
import AuthPage from './pages/AuthPage'
import ProfileWorkspace from './modules/auth/components/ProfileWorkspace'
import { AuthProvider } from './context/state'
import { useAuth } from './context/authContext'
import './App.css'

function SessionApp() {
  const { user, loading, error, sessionPending, refreshMe, clearSession, acceptSession } = useAuth()
  const [notice, setNotice] = useState<string | null>(null)
  const navigate = useNavigate()
  const endSession = useCallback((message: string) => {
    clearSession(); setNotice(message); navigate('/login', { replace: true })
  }, [clearSession, navigate])
  if (sessionPending) return <main className="app-shell"><section className="content-card" aria-busy={loading}>
    {loading ? <p role="status">Verificando sessão...</p> : <><p role="alert">{error}</p>
      <button onClick={() => void refreshMe()}>Tentar novamente</button><button onClick={() => endSession('Entre novamente.')}>Voltar ao login</button></>}
  </section></main>
  return user ? <ProfileWorkspace user={user} onSessionEnd={endSession} /> : <AuthPage notice={notice ?? error} onAuthenticated={next => {
    acceptSession(next); setNotice(null); navigate('/', { replace: true })
  }} />
}
export default function App() {
  return <BrowserRouter><AuthProvider><SessionApp /></AuthProvider></BrowserRouter>
}
