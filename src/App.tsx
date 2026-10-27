import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import AuthPage from './pages/AuthPage'
import {
  ApiError,
  clearSessionToken,
  getCurrentUser,
  hasSessionToken,
  logout,
  sendInvitation,
  type AuthUser,
} from './services/AuthService'
import './App.css'

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof TypeError) {
    return 'Não foi possível conectar à API. Verifique sua conexão e tente novamente.'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Não foi possível concluir a solicitação. Tente novamente.'
}

function App() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isCheckingSession, setIsCheckingSession] = useState(hasSessionToken)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [invitationEmail, setInvitationEmail] = useState('')
  const [isSendingInvitation, setIsSendingInvitation] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [invitationError, setInvitationError] = useState<string | null>(null)
  const [invitationSuccess, setInvitationSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!hasSessionToken()) {
      return
    }

    let isMounted = true
    getCurrentUser()
      .then((currentUser) => {
        if (isMounted) {
          setUser(currentUser)
        }
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return
        }
        if (error instanceof ApiError && error.status === 401) {
          clearSessionToken()
        } else {
          setNotice(getErrorMessage(error))
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsCheckingSession(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  function handleInvitationEmailChange(event: ChangeEvent<HTMLInputElement>) {
    setInvitationEmail(event.target.value)
    setInvitationError(null)
    setInvitationSuccess(null)
  }

  async function handleInvitationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setInvitationError(null)
    setInvitationSuccess(null)
    setIsSendingInvitation(true)

    try {
      const invitation = await sendInvitation(invitationEmail)
      setInvitationSuccess(
        `Convite enviado para ${invitation.email}. Ele expira em ${new Date(invitation.expires_at).toLocaleDateString('pt-BR')}.`,
      )
      setInvitationEmail('')
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        clearSessionToken()
        setUser(null)
        setNotice('Sua sessão expirou. Entre novamente para continuar.')
      } else {
        setInvitationError(getErrorMessage(error))
      }
    } finally {
      setIsSendingInvitation(false)
    }
  }

  async function handleLogout() {
    setNotice(null)
    setIsLoggingOut(true)
    try {
      await logout()
      setUser(null)
      setInvitationEmail('')
      setInvitationError(null)
      setInvitationSuccess(null)
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        clearSessionToken()
        setUser(null)
        setNotice('Sua sessão expirou. Entre novamente para continuar.')
      } else {
        setNotice(getErrorMessage(error))
      }
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (isCheckingSession) {
    return (
      <main className="app-shell">
        <p className="loading-message" role="status">Verificando sessão...</p>
      </main>
    )
  }

  if (!user) {
    return (
      <AuthPage
        notice={notice}
        onAuthenticated={(authenticatedUser) => {
          setNotice(null)
          setUser(authenticatedUser)
        }}
      />
    )
  }

  return (
    <main className="app-shell">
      <section className="auth-card session-card" aria-labelledby="session-title">
        <p className="brand">GrafoNet</p>
        <h1 className="auth-heading" id="session-title">Você está conectado</h1>
        <p className="session-description">Sessão autenticada para:</p>
        <p className="session-email">{user.email}</p>
        {notice && <p className="session-error" role="alert">{notice}</p>}

        <form className="auth-form" onSubmit={handleInvitationSubmit} aria-busy={isSendingInvitation}>
          <div className="form-field">
            <label htmlFor="invitation-email">Enviar convite por e-mail</label>
            <input
              id="invitation-email"
              name="invitation-email"
              type="email"
              autoComplete="email"
              placeholder="colega@insper.edu.br"
              value={invitationEmail}
              onChange={handleInvitationEmailChange}
              required
            />
          </div>
          {invitationError && <p className="form-error" role="alert">{invitationError}</p>}
          {invitationSuccess && <p className="form-success" role="status">{invitationSuccess}</p>}
          <button
            className="submit-button"
            type="submit"
            disabled={isSendingInvitation}
          >
            {isSendingInvitation ? 'Enviando...' : 'Enviar convite'}
          </button>
        </form>

        <button
          className="logout-button"
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Saindo...' : 'Sair'}
        </button>
      </section>
    </main>
  )
}

export default App
