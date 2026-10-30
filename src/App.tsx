import { useCallback, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router'
import LoadingScreen from './components/LoadingScreen'
import LoginPage from './pages/LoginPage'
import ProfileWorkspace from './pages/ProfileWorkspace'
import RegisterPage from './pages/RegisterPage'
import { AuthProvider } from './context/state'
import { useAuth } from './context/authContext'
import './App.css'

function SessionApp() {
  const { user, loading, error, sessionPending, refreshMe, clearSession } = useAuth()
  const [notice, setNotice] = useState<string | null>(null)
  const navigate = useNavigate()
  const endSession = useCallback((message: string) => {
    clearSession(); setNotice(message); navigate('/login', { replace: true })
  }, [clearSession, navigate])
  const finishRegistration = useCallback(() => {
    setNotice('Cadastro concluído. Agora você já pode entrar.'); navigate('/login', { replace: true })
  }, [navigate])
  if (sessionPending) return <main className="app-shell"><section className={loading ? undefined : 'content-card'} aria-busy={loading}>
    {loading ? <LoadingScreen message="Verificando sua sessão..." /> : <><p role="alert">{error}</p>
      <button onClick={() => void refreshMe()}>Tentar novamente</button><button onClick={() => endSession('Entre novamente.')}>Voltar ao login</button></>}
  </section></main>
  if (user) return <Routes>
    <Route path="/login" element={<Navigate to="/" replace />} />
    <Route path="/register" element={<Navigate to="/" replace />} />
    <Route path="*" element={<ProfileWorkspace user={user} onSessionEnd={endSession} />} />
  </Routes>
  return <Routes>
    <Route path="/login" element={<LoginPage notice={notice} />} />
    <Route path="/register" element={<RegisterPage onRegistered={finishRegistration} />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
}
export default function App() {
  return <BrowserRouter><AuthProvider><SessionApp /></AuthProvider></BrowserRouter>
}
