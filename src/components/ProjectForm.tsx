import { useState, type FormEvent } from 'react'
import type { ProfileOptions, ProjectInput } from '../types/profile'
import { statusLabels } from '../types/profile'

interface Props { initial: ProjectInput; options: ProfileOptions; onSave: (value: ProjectInput) => Promise<void>; onError: (error: unknown) => void }
export default function ProjectForm({ initial, options, onSave, onError }: Props) {
  const [value, setValue] = useState(initial)
  const [busy, setBusy] = useState(false)
  function field<K extends keyof ProjectInput>(key: K, next: ProjectInput[K]) { setValue(old => ({ ...old, [key]: next })) }
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true)
    try { await onSave(value) } catch (error) { onError(error) } finally { setBusy(false) }
  }
  return <form className="auth-form" onSubmit={submit} aria-busy={busy}>
    <div className="form-field"><label htmlFor="project-title">Título</label><input id="project-title" value={value.title} onChange={e => field('title', e.target.value)} maxLength={150} required /></div>
    <div className="form-field"><label htmlFor="project-description">Descrição</label><textarea id="project-description" rows={4} value={value.description} onChange={e => field('description', e.target.value)} maxLength={2000} required /></div>
    <div className="form-field"><label htmlFor="project-advisor">Orientador</label><input id="project-advisor" value={value.advisor} onChange={e => field('advisor', e.target.value)} maxLength={100} required /></div>
    <div className="form-field"><label htmlFor="project-field">Área da pesquisa</label><select id="project-field" value={value.field_id} onChange={e => field('field_id', e.target.value)} required>
      <option value="">Selecione a área</option>{options.fields.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
    </select></div>
    <div className="form-field"><label htmlFor="project-start">Data de início</label><input id="project-start" type="date" value={value.start_date} onChange={e => field('start_date', e.target.value)} required /></div>
    <div className="form-field"><label htmlFor="project-end">Data de fim (opcional)</label><input id="project-end" type="date" min={value.start_date || undefined} value={value.end_date ?? ''} onChange={e => field('end_date', e.target.value || null)} /></div>
    <div className="form-field"><label htmlFor="project-status">Situação</label><select id="project-status" value={value.status} onChange={e => field('status', e.target.value)} required>
      {options.statuses.map(item => <option key={item} value={item}>{statusLabels[item]}</option>)}
    </select></div>
    <button className="submit-button" disabled={busy}>{busy ? 'Salvando...' : 'Salvar pesquisa'}</button>
  </form>
}
