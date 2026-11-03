import { useEffect, useRef, useState } from 'react'
import { ApiError } from '../services/AuthService'
import { getParticipations, getProjects, reviewParticipation } from '../services/ResearchService'
import type { ParticipationStatus, Project, ReceivedParticipation } from '../types/profile'
import { failureMessage } from '../services/errors'

const labels: Record<ParticipationStatus, string> = { pending: 'Pendentes', confirmed: 'Confirmadas', rejected: 'Rejeitadas' }
export default function OrientationsPage({ onError }: { onError: (error: unknown) => void }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [status, setStatus] = useState<ParticipationStatus>('pending')
  const [items, setItems] = useState<ReceivedParticipation[] | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const lock = useRef(false)
  const mounted = useRef(false)
  const [retry, setRetry] = useState(0)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  useEffect(() => {
    let active = true
    const controller = new AbortController()
    Promise.all([getParticipations(status, controller.signal), getProjects(controller.signal)]).then(([next, catalog]) => { if (active) { setItems(next); setProjects(catalog) } }).catch(cause => {
      if (active) { setError(failureMessage(cause)); if (cause instanceof ApiError && cause.status === 401) onError(cause) }
    })
    return () => { active = false; controller.abort() }
  }, [status, retry, onError])
  async function review(id: string, decision: 'confirmed' | 'rejected') {
    if (lock.current) return
    lock.current = true; setBusy(id); setError(''); setNotice('')
    try {
      await reviewParticipation(id, decision)
      if (mounted.current) { setItems(null); setRetry(value => value + 1); setNotice(decision === 'confirmed' ? 'Orientação confirmada.' : 'Orientação rejeitada.') }
    } catch (cause) {
      if (!mounted.current) return
      setError(failureMessage(cause))
      if (cause instanceof ApiError && cause.status === 401) onError(cause)
      if (cause instanceof ApiError && (cause.status === 409 || cause.status === 404)) {
        setItems(null); setError(''); setNotice(cause.message); setRetry(value => value + 1)
      }
    } finally { lock.current = false; if (mounted.current) setBusy(null) }
  }
  return <section className="content-card"><h1>Orientações</h1>
    <div className="form-field"><label htmlFor="orientation-status">Situação</label><select id="orientation-status" disabled={busy !== null} value={status} onChange={event => { setItems(null); setError(''); setNotice(''); setStatus(event.target.value as ParticipationStatus) }}>
      {Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
    </select></div>
    {notice && <p role="status">{notice}</p>}
    {error && <p className="form-error" role="alert">{error}<button onClick={() => { setItems(null); setError(''); setRetry(value => value + 1) }}>Tentar novamente</button></p>}
    {!items && !error && <p role="status">Carregando orientações...</p>}
    {items?.length === 0 && <p>Nenhuma orientação nesta situação.</p>}
    {items?.map(({ profile_id, profile_name, participation }) => <article className="project-card" key={`${profile_id}:${participation.id}`}>
      <h2>{profile_name}</h2><p>{projects.find(project => project.id === participation.project_id)?.title ?? participation.project_id}</p>
      <p>Papel: {participation.role}</p><p>Período: {participation.start_date} a {participation.end_date ?? 'em andamento'}</p><p>Situação: {labels[participation.status]}</p>
      {participation.status === 'pending' && <div className="actions"><button className="secondary-button" disabled={busy !== null} onClick={() => void review(participation.id, 'confirmed')}>{busy === participation.id ? 'Enviando...' : 'Confirmar'}</button><button className="secondary-button" disabled={busy !== null} onClick={() => void review(participation.id, 'rejected')}>Rejeitar</button></div>}
    </article>)}
  </section>
}
