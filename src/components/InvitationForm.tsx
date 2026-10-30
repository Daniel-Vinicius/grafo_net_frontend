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
  return <div className="wide-view">
    <div className="page-heading"><div><p className="eyebrow">Crescimento por relações reais</p><h1>Convites</h1><p>Quem aceita seu convite entra na rede com você como primeira conexão.</p></div></div>
    <div className="invite-layout">
      <section className="invite-explainer">
        <span className="step-number">01</span><h2>Você convida alguém que conhece</h2><p>O convite fica associado ao seu perfil e possui validade de sete dias.</p>
        <span className="step-number">02</span><h2>A pessoa verifica seu vínculo</h2><p>Ela cria a conta usando sua identificação da comunidade Insper.</p>
        <span className="step-number">03</span><h2>A primeira conexão é criada</h2><p>Ao aceitar o convite, os dois confirmam a relação e o novo perfil entra no grafo.</p>
      </section>
      <section className="invite-history">
        <div className="section-title"><div><p className="eyebrow">Novo convite</p><h2>Enviar por e-mail</h2></div></div>
        <form className="auth-form" onSubmit={submit} aria-busy={busy}>
          <div className="form-field"><label htmlFor="invite-email">E-mail de quem você quer convidar</label><input id="invite-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          {success && <p className="form-success" role="status">{success}</p>}
          <button className="submit-button" disabled={busy}>{busy ? 'Enviando...' : 'Enviar convite'}</button>
        </form>
      </section>
    </div>
  </div>
}
