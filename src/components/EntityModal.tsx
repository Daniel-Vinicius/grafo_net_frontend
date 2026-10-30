import { useState, type FormEvent } from 'react'
import Modal from './Modal'
import PeriodFields from './PeriodFields'
import type { MembershipInput, Option } from '../types/profile'

interface Props { initial: MembershipInput | null; entities: Option[]; onSave: (value: MembershipInput) => Promise<void>; onRemove: (() => Promise<void>) | null; onClose: () => void; onError: (error: unknown) => void }
export default function EntityModal({ initial, entities, onSave, onRemove, onClose, onError }: Props) {
  const [value, setValue] = useState<MembershipInput>(initial ?? { entity_id: '', role: '', start_date: '', end_date: null })
  const [busy, setBusy] = useState(false)
  async function run(operation: () => Promise<void>) {
    setBusy(true)
    try { await operation() } catch (error) { onError(error) } finally { setBusy(false) }
  }
  function submit(event: FormEvent) { event.preventDefault(); void run(() => onSave(value)) }
  return <Modal labelledBy="entity-title" onClose={onClose}>
    <h2 id="entity-title">{onRemove ? 'Editar entidade' : 'Adicionar entidade'}</h2>
    <form className="auth-form" onSubmit={submit} aria-busy={busy}>
      <div className="form-field"><label htmlFor="entity-id">Entidade</label><select id="entity-id" value={value.entity_id} disabled={!!initial} onChange={e => setValue(old => ({ ...old, entity_id: e.target.value }))} required>
        <option value="">Selecione a entidade</option>{entities.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select></div>
      <div className="form-field"><label htmlFor="entity-role">Cargo (opcional)</label><input id="entity-role" value={value.role} onChange={e => setValue(old => ({ ...old, role: e.target.value }))} maxLength={100} /></div>
      <PeriodFields id="entity" start={value.start_date} end={value.end_date} onChange={(start_date, end_date) => setValue(old => ({ ...old, start_date, end_date }))} />
      <button className="submit-button" disabled={busy}>{busy ? 'Salvando...' : 'Salvar entidade'}</button>
      {onRemove && <button type="button" className="secondary-button" disabled={busy} onClick={() => void run(onRemove)}>Remover entidade</button>}
    </form>
  </Modal>
}
