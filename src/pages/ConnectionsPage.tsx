import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import ProfileAvatar from '../components/graph/ProfileAvatar'
import { acceptConnection, removeConnection } from '../services/GraphService'
import { getProfileById } from '../services/ProfileService'
import type { Connection } from '../types/graph'
import type { Profile } from '../types/profile'
import { describeProfile, plural } from '../utils/profileText'

const limit = 10
interface Props { meId: string; connections: Connection[]; onChanged: () => Promise<void>; onError: (error: unknown) => void }
export default function ConnectionsPage({ meId, connections, onChanged, onError }: Props) {
  const [people, setPeople] = useState(new Map<string, Profile>())
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const other = (item: Connection) => item.user_a_id === meId ? item.user_b_id : item.user_a_id
  const ids = connections.map(other).sort().join(',')
  useEffect(() => {
    let active = true
    // GET /connections traz só os ids; o perfil de cada pessoa vem à parte.
    Promise.all(ids.split(',').filter(Boolean).map(getProfileById))
      .then(found => { if (active) setPeople(new Map(found.map(item => [item.id, item]))) })
      .catch(error => { if (active) onError(error) })
    return () => { active = false }
  }, [ids, onError])
  async function run(operation: () => Promise<void>) {
    setBusy(true)
    try { await operation(); await onChanged() } catch (error) { onError(error) } finally { setBusy(false) }
  }
  function card(item: Connection, actions: ReactNode) {
    const person = people.get(other(item))
    if (!person) return null
    return <article className="connection-card" key={item.id}>
      <ProfileAvatar profile={person} className="mini-avatar" />
      <h3>{person.name}</h3>
      <p>{describeProfile(person)}</p>
      <div className="tag-row">{person.entities[0] && <span className="tag">{person.entities[0].name}</span>}</div>
      <div className="connection-actions">{actions}</div>
    </article>
  }
  const accepted = connections.filter(item => item.status === 'accepted')
  const received = connections.filter(item => item.status === 'pending' && item.requested_by !== meId)
  const sent = connections.filter(item => item.status === 'pending' && item.requested_by === meId)
  return <div className="wide-view">
    <div className="page-heading"><div><p className="eyebrow">Sua base de confiança</p><h1>Conexões próximas</h1><p>Relações confirmadas que formam o primeiro nível da sua rede.</p></div></div>
    <div className="limit-card">
      <div><span>Limite de conexões próximas</span><strong>{accepted.length} de {limit}</strong><p>O limite preserva o significado das relações no grafo.</p></div>
      <div className="limit-meter" role="progressbar" aria-valuenow={accepted.length} aria-valuemin={0} aria-valuemax={limit} aria-label="Conexões usadas"><i style={{ width: `${accepted.length / limit * 100}%` }} /></div>
    </div>
    {received.length > 0 && <><h2 className="connection-heading">{plural(received.length, 'pedido recebido', 'pedidos recebidos')}</h2><div className="connection-grid">
      {received.map(item => card(item, <>
        <button type="button" className="is-primary" disabled={busy} onClick={() => void run(() => acceptConnection(item.id))}>Aceitar</button>
        <button type="button" disabled={busy} onClick={() => void run(() => removeConnection(item.id))}>Recusar</button>
      </>))}
    </div></>}
    {sent.length > 0 && <><h2 className="connection-heading">{plural(sent.length, 'pedido enviado', 'pedidos enviados')}</h2><div className="connection-grid">
      {sent.map(item => card(item, <button type="button" disabled={busy} onClick={() => void run(() => removeConnection(item.id))}>Cancelar pedido</button>))}
    </div></>}
    {accepted.length > 0 && <div className="connection-grid">
      {accepted.map(item => card(item, <>
        <button type="button" onClick={() => navigate('/', { state: { personId: other(item) } })}>Ver no grafo</button>
        <button type="button" disabled={busy} onClick={() => { if (window.confirm('Encerrar esta conexão próxima? Os caminhos da rede podem mudar.')) void run(() => removeConnection(item.id)) }}>Remover</button>
      </>))}
    </div>}
    {!connections.length && <p className="empty-profile-field">Você ainda não tem conexões. <Link to="/invitations">Envie um convite</Link> para começar.</p>}
  </div>
}
