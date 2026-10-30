import { useState, type FormEvent } from 'react'
import AuthLayout from '../components/AuthLayout'
import PasswordField from '../components/PasswordField'
import { useAuth } from '../context/authContext'

export default function LoginPage({ notice }: { notice: string | null }) {
  const { login, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await login(email.trim(), password)
  }

  return <AuthLayout eyebrow="Bem-vindo de volta" title="Entre na sua rede" description="Use seu e-mail institucional para continuar.">
    {error ? <p className="form-error" role="alert">{error}</p> : notice && <p className="form-success" role="status">{notice}</p>}
    <form className="auth-form" onSubmit={handleSubmit} aria-busy={loading}>
      <div className="form-field">
        <label htmlFor="email">E-mail</label>
        <div className="input-group">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
          <input id="email" name="email" type="email" autoComplete="username" placeholder="voce@al.insper.edu.br" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
      </div>
      <PasswordField value={password} onChange={setPassword} autoComplete="current-password" placeholder="Digite sua senha" />
      <button className="submit-button" type="submit" disabled={loading}>
        {loading ? 'Entrando...' : <>Entrar <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg></>}
      </button>
    </form>
  </AuthLayout>
}
