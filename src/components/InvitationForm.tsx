import { useState, type FormEvent } from 'react'
import { sendInvitation } from '../services/AuthService'

export default function InvitationForm({ onError }: { onError: (error: unknown) => void }) {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setSuccess('')
    try {
      const invite = await sendInvitation(email)
      setSuccess(`Convite enviado para ${invite.email}. Expira em ${new Date(invite.expires_at).toLocaleDateString('pt-BR')}.`)
      setEmail('')
    } catch (error) { onError(error) } finally { setBusy(false) }
  }
  return <section className="content-card"><h1>Convites</h1><form className="auth-form" onSubmit={submit} aria-busy={busy}>
    <div className="form-field"><label htmlFor="invite-email">Enviar convite por e-mail</label><input id="invite-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
    {success && <p className="form-success" role="status">{success}</p>}
    <button className="submit-button" disabled={busy}>{busy ? 'Enviando...' : 'Enviar convite'}</button>
  </form></section>
}
