import { useState, type FormEvent } from 'react'
import { changeEmail, changePassword, deleteAccount } from '../service'

interface Props {
  onComplete: (message: string) => void
  onError: (error: unknown) => void
}
function CredentialForm({ kind, onComplete, onError }: Props & { kind: 'email' | 'password' }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const isEmail = kind === 'email'
  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (!isEmail && next !== confirmation) { setError('As novas senhas não coincidem.'); return }
    setBusy(true)
    try {
      await (isEmail ? changeEmail(current, next) : changePassword(current, next))
      setCurrent(''); setNext(''); setConfirmation('')
      onComplete(`${isEmail ? 'E-mail alterado' : 'Senha alterada'}. Entre novamente.`)
    } catch (error) { onError(error) } finally { setBusy(false) }
  }
  return <form className="auth-form setting-section" onSubmit={submit} aria-busy={busy}>
    <h2>Alterar {isEmail ? 'e-mail' : 'senha'}</h2>
    <div className="form-field"><label htmlFor={`${kind}-current`}>Senha atual para alterar {isEmail ? 'e-mail' : 'senha'}</label>
      <input id={`${kind}-current`} type="password" autoComplete="current-password" value={current} onChange={e => setCurrent(e.target.value)} required /></div>
    <div className="form-field"><label htmlFor={`${kind}-new`}>{isEmail ? 'Novo e-mail institucional' : 'Nova senha'}</label>
      <input id={`${kind}-new`} type={isEmail ? 'email' : 'password'} autoComplete={isEmail ? 'email' : 'new-password'}
        value={next} onChange={e => setNext(e.target.value)} minLength={isEmail ? undefined : 8} required /></div>
    {!isEmail && <div className="form-field"><label htmlFor="password-confirmation">Confirme a nova senha</label>
      <input id="password-confirmation" type="password" autoComplete="new-password" value={confirmation} onChange={e => setConfirmation(e.target.value)} required /></div>}
    {error && <p role="alert" className="form-error">{error}</p>}
    <button className="submit-button" disabled={busy}>{busy ? 'Salvando...' : `Alterar ${isEmail ? 'e-mail' : 'senha'}`}</button>
  </form>
}
export default function AccountSettings(props: Props) {
  const [password, setPassword] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  async function remove(event: FormEvent) {
    event.preventDefault()
    if (!confirmed) return
    setBusy(true)
    try {
      await deleteAccount(password)
      setPassword('')
      props.onComplete('Sua conta foi excluída.')
    } catch (error) { props.onError(error) } finally { setBusy(false) }
  }
  return <section className="content-card"><h1>Configurações da conta</h1>
    <p>Alterar e-mail ou senha encerra todas as suas sessões.</p>
    <CredentialForm kind="email" {...props} /><CredentialForm kind="password" {...props} />
    <form className="auth-form setting-section danger-zone" onSubmit={remove} aria-busy={busy}>
      <h2>Excluir conta</h2><p>Seu perfil e sua foto serão removidos. As pesquisas compartilhadas continuarão disponíveis sem vínculo com sua conta.</p>
      <div className="form-field"><label htmlFor="delete-password">Senha atual para excluir conta</label>
        <input id="delete-password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
      <label className="checkbox-label"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} required />Entendo que a exclusão é definitiva e desejo excluir minha conta.</label>
      <button className="submit-button danger-button" disabled={busy || !confirmed}>{busy ? 'Excluindo...' : 'Excluir minha conta'}</button>
    </form>
  </section>
}
