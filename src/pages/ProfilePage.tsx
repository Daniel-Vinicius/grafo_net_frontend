import { useState } from 'react'
import { Link } from 'react-router'
import EntityModal from '../components/EntityModal'
import ExperienceModal from '../components/ExperienceModal'
import Icon from '../components/Icon'
import PhotoPanel from '../components/PhotoPanel'
import { updateProfile } from '../services/ProfileService'
import { statusLabels, type Experience, type ExperienceInput, type MembershipInput, type Option, type Profile } from '../types/profile'
import { experienceTimeline, formatPeriod } from '../utils/experienceTimeline'
import { profileCompleteness } from '../utils/profileCompleteness'
import { describeProfile } from '../utils/profileText'

interface EntityRow { key: string; name: string; membership: MembershipInput | null }
function entityRows(profile: Profile, entities: Option[]): EntityRow[] {
  const name = (id: string) => entities.find(item => item.id === id)?.name ?? ''
  const withPeriod = new Set(profile.entity_memberships.map(item => item.entity_id))
  return [
    ...profile.entity_memberships.map(item => ({ key: item.id, name: name(item.entity_id), membership: item })),
    ...profile.entity_ids.filter(id => !withPeriod.has(id)).map(id => ({ key: id, name: name(id), membership: null })),
  ]
}
interface Props { profile: Profile; entities: Option[]; userId: string; onChanged: () => Promise<void>; onError: (error: unknown) => void }
export default function ProfilePage({ profile, entities, userId, onChanged, onError }: Props) {
  const [experience, setExperience] = useState<Experience | 'new' | null>(null)
  const [entity, setEntity] = useState<EntityRow | 'new' | null>(null)
  const [busy, setBusy] = useState(false)
  const completeness = profileCompleteness(profile)
  const rows = entityRows(profile, entities)
  async function saveExperiences(experiences: ExperienceInput[]) {
    await updateProfile({ experiences }); await onChanged(); setExperience(null)
  }
  // A lista é substituída por inteiro: tudo que não for enviado é apagado.
  async function saveExperience(value: ExperienceInput) {
    await saveExperiences(value.id ? profile.experiences.map(item => item.id === value.id ? { ...value, id: item.id } : item) : [...profile.experiences, value])
  }
  async function saveMemberships(entity_memberships: MembershipInput[], entity_ids: string[]) {
    await updateProfile({ entity_ids, entity_memberships }); await onChanged(); setEntity(null)
  }
  async function saveMembership(value: MembershipInput) {
    const memberships = value.id ? profile.entity_memberships.map(item => item.id === value.id ? value : item) : [...profile.entity_memberships, value]
    await saveMemberships(memberships, [...new Set([...profile.entity_ids, value.entity_id])])
  }
  async function removeEntity(row: EntityRow) {
    const memberships = profile.entity_memberships.filter(item => item.id !== row.membership?.id)
    const entityId = row.membership?.entity_id ?? row.key
    await saveMemberships(memberships, memberships.some(item => item.entity_id === entityId) ? profile.entity_ids : profile.entity_ids.filter(id => id !== entityId))
  }
  async function removeProject(id: string) {
    if (!window.confirm('Remover esta pesquisa do seu perfil?')) return
    setBusy(true)
    try { await updateProfile({ research_project_ids: profile.research_project_ids.filter(item => item !== id) }); await onChanged() } catch (error) { onError(error) } finally { setBusy(false) }
  }
  return <div className="wide-view">
    <div className="page-heading">
      <div><p className="eyebrow">Como a rede encontra você</p><h1>Meu perfil</h1><p>Mantenha suas experiências claras para aparecer nas buscas certas.</p></div>
      <Link className="primary-button" to="/profile/edit">Editar perfil</Link>
    </div>
    <div className="profile-layout">
      <aside className="profile-identity">
        <PhotoPanel profileId={profile.id} name={profile.name} photoId={profile.photo_id} onChanged={onChanged} onError={onError} />
        <h2>{profile.name}</h2>
        <p>{describeProfile(profile)}</p>
        {profile.bio && <p className="preserve-lines">{profile.bio}</p>}
        <div className="profile-completeness">
          <span><b>{completeness}%</b> do perfil completo</span>
          <div role="progressbar" aria-valuenow={completeness} aria-valuemin={0} aria-valuemax={100} aria-label="Perfil completo"><i style={{ width: `${completeness}%` }} /></div>
          <small>O cadastro mínimo já permite usar o grafo. Complete aos poucos para aparecer em buscas mais específicas.</small>
        </div>
        <div className="tag-row">{profile.entities.map(item => <span className="chip" key={item.id}>{item.name}</span>)}</div>
      </aside>
      <section className="profile-details">
        <div className="detail-section">
          <div className="section-title"><div><p className="eyebrow">Trajetória</p><h2>Experiências</h2></div><button className="quiet-button" type="button" onClick={() => setExperience('new')}><Icon name="plus" /> Adicionar</button></div>
          {!profile.experiences.length && <p className="empty-profile-field">Nenhuma experiência adicionada ainda.</p>}
          {experienceTimeline(profile.experiences).map(group => <article className="experience-item" key={group.roles[0].id}>
            {group.roles.length > 1 && <h3>{group.organization}</h3>}
            {group.roles.length > 1 && <p className="experience-progress">{[...group.roles].reverse().map(item => item.title).join(' → ')}</p>}
            {group.roles.map(item => <div className="experience-role" key={item.id}>
              <div><h4>{item.title}</h4><span>{group.roles.length === 1 ? `${item.organization} · ` : ''}{formatPeriod(item.start_date, item.end_date)}</span>{item.description && <p className="preserve-lines">{item.description}</p>}</div>
              <button className="quiet-button" type="button" aria-label={`Editar ${item.title}`} onClick={() => setExperience(item)}>Editar</button>
            </div>)}
          </article>)}
        </div>
        <div className="detail-section">
          <div className="section-title"><div><p className="eyebrow">Comunidades</p><h2>Entidades</h2></div><button className="quiet-button" type="button" onClick={() => setEntity('new')}><Icon name="plus" /> Adicionar</button></div>
          {!rows.length && <p className="empty-profile-field">Nenhuma participação informada.</p>}
          {rows.map(row => <div className="profile-row" key={row.key}>
            <div><b>{row.name}</b><small>{row.membership ? [row.membership.role, formatPeriod(row.membership.start_date, row.membership.end_date)].filter(Boolean).join(' · ') : 'Sem período informado: necessário para o vínculo de Mesma Entidade'}</small></div>
            <button className="quiet-button" type="button" aria-label={`Editar ${row.name}`} onClick={() => setEntity(row)}>Editar</button>
          </div>)}
        </div>
        <div className="detail-section">
          <div className="section-title"><div><p className="eyebrow">Iniciação científica</p><h2>Pesquisas</h2></div><Link className="quiet-button" to="/profile/research/new"><Icon name="plus" /> Adicionar</Link></div>
          {!profile.research_projects.length && <p className="empty-profile-field">Nenhuma pesquisa adicionada.</p>}
          {profile.research_projects.map(item => <div className="profile-row" key={item.id}>
            <div><b>{item.title}</b><small>{statusLabels[item.status]} · {formatPeriod(item.start_date, item.end_date)} · Orientação: {item.advisor}</small></div>
            <div className="profile-row-actions">
              {item.creator_id === userId && <Link className="quiet-button" to={`/profile/research/${item.id}/edit`} aria-label={`Editar ${item.title}`}>Editar</Link>}
              <button className="quiet-button" type="button" disabled={busy} aria-label={`Remover ${item.title}`} onClick={() => void removeProject(item.id)}>Remover</button>
            </div>
          </div>)}
        </div>
      </section>
    </div>
    {experience && <ExperienceModal initial={experience === 'new' ? null : experience} onClose={() => setExperience(null)} onError={onError} onSave={saveExperience}
      onRemove={() => saveExperiences(profile.experiences.filter(item => experience !== 'new' && item.id !== experience.id))} />}
    {entity && <EntityModal initial={entity === 'new' ? null : entity.membership ?? { entity_id: entity.key, role: '', start_date: '', end_date: null }} entities={entities.filter(item => entity !== 'new' || !profile.entity_ids.includes(item.id))} onClose={() => setEntity(null)} onError={onError} onSave={saveMembership}
      onRemove={entity === 'new' ? null : () => removeEntity(entity)} />}
  </div>
}
