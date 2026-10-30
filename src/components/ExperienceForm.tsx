import { useState, type FormEvent } from 'react'
import type { Option, Profile } from '../types/profile'

interface Props { profile: Profile; entities: Option[]; onboarding: boolean; onSave: (entityIds: string[]) => Promise<void>; onSkip: () => Promise<void>; onError: (error: unknown) => void }
export default function ExperienceForm({ profile, entities, onboarding, onSave, onSkip, onError }: Props) {
  const [entityIds, setEntityIds] = useState(profile.entity_ids)
  const [busy, setBusy] = useState(false)
  function toggle(id: string) { setEntityIds(ids => ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id]) }
  async function run(operation: () => Promise<void>) {
    setBusy(true)
    try { await operation() } catch (error) { onError(error) } finally { setBusy(false) }
  }
  function submit(event: FormEvent) { event.preventDefault(); void run(() => onSave(entityIds)) }
  return <section className="content-card"><h1>{onboarding ? 'Adicione suas entidades' : 'Editar entidades'}</h1>
    <p>Selecione as entidades de que participa. Experiências e pesquisas ficam no seu perfil, e você poderá completá-las depois.</p>
    <form className="auth-form" onSubmit={submit} aria-busy={busy}>
      <fieldset disabled={busy}><legend>Entidades</legend>{entities.map(item => <label className="checkbox-label" key={item.id}>
        <input type="checkbox" checked={entityIds.includes(item.id)} onChange={() => toggle(item.id)} />{item.name}
      </label>)}</fieldset>
      <button className="submit-button" disabled={busy}>{busy ? 'Salvando...' : 'Salvar entidades'}</button>
      {onboarding && <button type="button" className="secondary-button" disabled={busy} onClick={() => void run(onSkip)}>Pular por enquanto</button>}
    </form>
  </section>
}
