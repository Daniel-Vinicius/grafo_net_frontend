import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useSearchParams } from 'react-router'
import AuthLayout from '../components/AuthLayout'
import PasswordField from '../components/PasswordField'
import CourseSemesterFields from '../components/CourseSemesterFields'
import { getErrorMessage } from '../services/apiClient'
import { register } from '../services/AuthService'
import { getOptions } from '../services/ProfileService'
import { emptyProfile, type ProfileOptions } from '../types/profile'

// Só é acessível pelo link do convite: sem token na URL, volta para o login.
export default function RegisterPage({ onRegistered }: { onRegistered: () => void }) {
  const [searchParams] = useSearchParams()
  const inviteToken = searchParams.get('token')
  const [profile, setProfile] = useState(emptyProfile)
  const [options, setOptions] = useState<ProfileOptions | null>(null)
  const [optionsAttempt, setOptionsAttempt] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!inviteToken) return
    let active = true
    getOptions().then(data => { if (active) setOptions(data) })
      .catch((cause: unknown) => { if (active) setError(getErrorMessage(cause)) })
    return () => { active = false }
  }, [inviteToken, optionsAttempt])

  if (!inviteToken) return <Navigate to="/login" replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await register({ profile, email: email.trim(), password, invite_token: inviteToken! })
      onRegistered()
    } catch (cause: unknown) {
      setError(getErrorMessage(cause))
      setIsSubmitting(false)
    }
  }

  return <AuthLayout eyebrow="Você foi convidado" title="Crie seu acesso">
    {error && <p className="form-error" role="alert">{error}</p>}
    <form className="auth-form" onSubmit={handleSubmit} aria-busy={isSubmitting}>
      <div className="form-field">
        <label htmlFor="profile-name">Nome</label>
        <input id="profile-name" autoComplete="name" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} maxLength={100} required />
      </div>
      <div className="form-field">
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="email" placeholder="voce@al.insper.edu.br" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <PasswordField value={password} onChange={setPassword} autoComplete="new-password" placeholder="Mínimo de 8 caracteres" minLength={8} />
      {options
        ? <CourseSemesterFields value={profile} options={options} onChange={setProfile} />
        : <p role="status">Carregando cursos... <button type="button" className="secondary-button" onClick={() => { setError(null); setOptionsAttempt(v => v + 1) }}>Tentar novamente</button></p>}
      <button className="submit-button" type="submit" disabled={isSubmitting || !options}>
        {isSubmitting ? 'Criando conta...' : <>Criar conta <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg></>}
      </button>
    </form>
  </AuthLayout>
}
