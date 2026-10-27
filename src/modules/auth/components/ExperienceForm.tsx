import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import type { Option, Profile, Project } from '../types'

interface Props { profile: Profile; entities: Option[]; projects: Project[]; onboarding: boolean; onSave: (entityIds: string[], projectIds: string[]) => Promise<void>; onSkip: () => Promise<void>; onError: (error: unknown) => void }
export default function ExperienceForm({ profile, entities, projects, onboarding, onSave, onSkip, onError }: Props) {
  const [entityIds, setEntityIds] = useState(profile.entity_ids)
  const [projectIds, setProjectIds] = useState(profile.research_project_ids)
  const [busy, setBusy] = useState(false)
  function toggle(ids: string[], id: string) { return ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id] }
  async function run(operation: () => Promise<void>) {
    setBusy(true)
    try { await operation() } catch (error) { onError(error) } finally { setBusy(false) }
  }
  function submit(event: FormEvent) { event.preventDefault(); void run(() => onSave(entityIds, projectIds)) }
  return <section className="content-card"><h1>{onboarding ? 'Adicione suas experiências' : 'Editar experiências'}</h1>
    <p>Selecione entidades e projetos de iniciação científica. Você poderá alterar essas escolhas depois.</p>
    <form className="auth-form" onSubmit={submit} aria-busy={busy}>
      <fieldset disabled={busy}><legend>Entidades</legend>{entities.map(item => <label className="checkbox-label" key={item.id}>
        <input type="checkbox" checked={entityIds.includes(item.id)} onChange={() => setEntityIds(toggle(entityIds, item.id))} />{item.name}
      </label>)}</fieldset>
      <fieldset disabled={busy}><legend>Iniciação científica</legend>{projects.length === 0 && <p>Nenhuma pesquisa cadastrada ainda.</p>}{projects.map(item => <label className="checkbox-label" key={item.id}>
        <input type="checkbox" checked={projectIds.includes(item.id)} onChange={() => setProjectIds(toggle(projectIds, item.id))} />{item.title}
      </label>)}</fieldset>
      <Link to="/research-projects/new">Criar um projeto de pesquisa</Link>
      <button className="submit-button" disabled={busy}>{busy ? 'Salvando...' : 'Salvar experiências'}</button>
      {onboarding && <button type="button" className="secondary-button" disabled={busy} onClick={() => void run(onSkip)}>Pular por enquanto</button>}
    </form>
  </section>
}
