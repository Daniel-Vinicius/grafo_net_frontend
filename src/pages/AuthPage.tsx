import { useState, type ChangeEvent, type FormEvent } from 'react'
import {
  ApiError,
  login,
  register,
  type AuthUser,
} from '../services/AuthService'

type AuthMode = 'login' | 'register'

interface AuthPageProps {
  notice: string | null
  onAuthenticated: (user: AuthUser) => void
}

function getSubmissionError(error: unknown): string {
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

export default function AuthPage({
  notice,
  onAuthenticated,
}: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(() =>
    new URLSearchParams(window.location.search).has('token')
      ? 'register'
      : 'login',
  )
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value)
  }

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    setName(event.target.value)
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value)
  }

  function handleModeChange(nextMode: AuthMode) {
    setMode(nextMode)
    setError(null)
    setSuccess(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (mode === 'register') {
      const inviteToken = new URLSearchParams(window.location.search).get('token')
      if (!inviteToken) {
        setError('O link de cadastro não contém um token de convite.')
        return
      }

      setIsSubmitting(true)
      try {
        await register({ name, email, password, invite_token: inviteToken })
        setPassword('')
        setMode('login')
        setSuccess('Cadastro concluído. Agora você já pode entrar.')
        const url = new URL(window.location.href)
        url.searchParams.delete('token')
        window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
      } catch (submissionError: unknown) {
        setError(getSubmissionError(submissionError))
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    setIsSubmitting(true)
    try {
      const user = await login({ email, password })
      setPassword('')
      onAuthenticated(user)
    } catch (submissionError: unknown) {
      setError(getSubmissionError(submissionError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const isRegistering = mode === 'register'

  return (
    <main className="app-shell">
      <section className="auth-card" aria-labelledby="auth-title">
        <p className="brand">GrafoNet</p>
        <h1 className="auth-heading" id="auth-title">
          {isRegistering ? 'Crie sua conta' : 'Acesse sua conta'}
        </h1>
        <p className="auth-description">
          {isRegistering
            ? 'Use seu e-mail, uma senha e o convite recebido para se cadastrar.'
            : 'Entre para continuar usando o GrafoNet.'}
        </p>

        <div className="auth-tabs" role="group" aria-label="Acesso à conta">
          <button
            className="auth-tab"
            type="button"
            aria-pressed={!isRegistering}
            disabled={isSubmitting}
            onClick={() => handleModeChange('login')}
          >
            Entrar
          </button>
          <button
            className="auth-tab"
            type="button"
            aria-pressed={isRegistering}
            disabled={isSubmitting}
            onClick={() => handleModeChange('register')}
          >
            Cadastrar
          </button>
        </div>

        {notice && <p className="session-error" role="status">{notice}</p>}
        {success && <p className="form-success" role="status">{success}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
          aria-busy={isSubmitting}
        >
          {isRegistering && (
            <div className="form-field">
              <label htmlFor="name">Nome</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Seu nome"
                value={name}
                onChange={handleNameChange}
                maxLength={100}
                required
              />
            </div>
          )}

          <div className="form-field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="voce@exemplo.com"
              value={email}
              onChange={handleEmailChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              placeholder="Digite sua senha"
              value={password}
              onChange={handlePasswordChange}
              minLength={isRegistering ? 8 : undefined}
              required
            />
          </div>

          <button
            className="submit-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Aguarde...'
              : isRegistering
                ? 'Criar conta'
                : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  )
}
