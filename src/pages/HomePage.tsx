import { useState } from 'react'
import type { SubmitEvent } from 'react'
import Button from '../components/Button'
import { useAuth } from '../context/authContext'

export default function HomePage() {
  const { user, loading, error, sessionPending, login, logout, refreshMe } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState<string | null>(null)

  async function handleLogin(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setResult(null)
    await login(email.trim(), password)
    setPassword('')
  }

  async function handleRefresh() {
    setResult(null)
    if (await refreshMe()) setResult('Usuário atualizado por /me.')
  }

  async function handleLogout() {
    setResult(null)
    if (await logout()) setResult('Sessão encerrada.')
  }

  return (
    <main className="auth-panel" aria-busy={loading}>
      <h1>GrafoNet</h1>
      {error && <p className="error" role="alert">{error}</p>}
      {result && <p role="status">{result}</p>}

      {sessionPending ? (
        <section aria-label="Verificação de sessão">
          {loading ? (
            <p role="status">Verificando sessão…</p>
          ) : (
            <>
              <p>A sessão ainda não foi verificada.</p>
              <Button onClick={handleRefresh}>Tentar novamente</Button>
            </>
          )}
        </section>
      ) : user ? (
        <section aria-label="Usuário autenticado">
          <h2>Usuário atual</h2>
          <dl>
            <dt>ID</dt>
            <dd>{user.id}</dd>
            <dt>E-mail</dt>
            <dd>{user.email}</dd>
          </dl>
          <div className="actions">
            <Button disabled={loading} onClick={handleRefresh}>Consultar /me</Button>
            <Button disabled={loading} onClick={handleLogout}>Sair</Button>
          </div>
          {loading && <p role="status">Aguarde…</p>}
        </section>
      ) : (
        <form onSubmit={handleLogin}>
          <h2>Entrar</h2>
          <fieldset disabled={loading}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Button type="submit">{loading ? 'Entrando…' : 'Entrar'}</Button>
          </fieldset>
        </form>
      )}
    </main>
  )
}
