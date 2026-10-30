import { useState, type FormEvent } from 'react'
import Modal from './Modal'
import PeriodFields from './PeriodFields'
import type { Experience, ExperienceInput } from '../types/profile'

const empty: ExperienceInput = { title: '', organization: '', type: '', start_date: '', end_date: null, description: '' }
interface Props { initial: Experience | null; onSave: (value: ExperienceInput) => Promise<void>; onRemove: () => Promise<void>; onClose: () => void; onError: (error: unknown) => void }
export default function ExperienceModal({ initial, onSave, onRemove, onClose, onError }: Props) {
  const [value, setValue] = useState<ExperienceInput>(initial ?? empty)
  const [busy, setBusy] = useState(false)
  function field(key: 'title' | 'organization' | 'description', next: string) { setValue(old => ({ ...old, [key]: next })) }
  async function run(operation: () => Promise<void>) {
    setBusy(true)
    try { await operation() } catch (error) { onError(error) } finally { setBusy(false) }
  }
  function submit(event: FormEvent) { event.preventDefault(); void run(() => onSave(value)) }
  return <Modal labelledBy="experience-title" onClose={onClose}>
    <h2 id="experience-title">{initial ? 'Editar experiência' : 'Adicionar experiência'}</h2>
    <form className="auth-form" onSubmit={submit} aria-busy={busy}>
      <div className="form-field"><label htmlFor="experience-role">Cargo ou atividade</label><input id="experience-role" value={value.title} onChange={e => field('title', e.target.value)} maxLength={150} required /></div>
      <div className="form-field"><label htmlFor="experience-organization">Organização</label><input id="experience-organization" value={value.organization} onChange={e => field('organization', e.target.value)} maxLength={150} required /><small>Use o mesmo nome em cargos da mesma organização para mostrar sua evolução.</small></div>
      <PeriodFields id="experience" start={value.start_date} end={value.end_date} onChange={(start_date, end_date) => setValue(old => ({ ...old, start_date, end_date }))} />
      <div className="form-field"><label htmlFor="experience-description">Descrição (opcional)</label><textarea id="experience-description" rows={3} value={value.description} onChange={e => field('description', e.target.value)} maxLength={2000} /></div>
      <button className="submit-button" disabled={busy}>{busy ? 'Salvando...' : 'Salvar experiência'}</button>
      {initial && <button type="button" className="secondary-button" disabled={busy} onClick={() => void run(onRemove)}>Remover experiência</button>}
    </form>
  </Modal>
}
