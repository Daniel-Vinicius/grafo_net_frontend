import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router'
import { ApiError, logout, type AuthUser } from '../services/AuthService'
import { getErrorMessage } from '../services/apiClient'
import { getConnections, getNetworkStats } from '../services/GraphService'
import { getEntities, getOptions, getProfile, saveProject, updateProfile } from '../services/ProfileService'
import { emptyProject, type Option, type Profile, type ProfileDetails, type ProfileInput, type ProfileOptions } from '../types/profile'
import type { Connection } from '../types/graph'
import ProfileFields from '../components/ProfileFields'
import ProfileDetailsFields from '../components/ProfileDetailsFields'
import AccountSettings from '../components/AccountSettings'
import ExperienceForm from '../components/ExperienceForm'
import ProjectForm from '../components/ProjectForm'
import InvitationForm from '../components/InvitationForm'
import AppSidebar from '../components/AppSidebar'
import LoadingScreen from '../components/LoadingScreen'
import ConnectionsPage from './ConnectionsPage'
import GraphPage from './GraphPage'
import ProfilePage from './ProfilePage'

interface Data { profile: Profile; options: ProfileOptions; entities: Option[] }
interface Props { user: AuthUser; onSessionEnd: (message: string) => void }
function ProfileEditor({ data, onSave, onError }: { data: Data; onSave: (value: ProfileInput & ProfileDetails) => Promise<void>; onError: (error: unknown) => void }) {
  const { name, course_id, semester, field_id, bio, type, entry_year, entry_semester, class_group, role, company } = data.profile
  const [value, setValue] = useState<ProfileInput & ProfileDetails>({ name, course_id, semester, field_id, bio, type, entry_year, entry_semester, class_group, role, company })
  const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true)
    try { await onSave(value) } catch (error) { onError(error) } finally { setBusy(false) }
  }
  return <section className="content-card"><h1>Editar perfil</h1><form className="auth-form" onSubmit={submit} aria-busy={busy}>
    <ProfileFields value={value} options={data.options} onChange={next => setValue(old => ({ ...old, ...next }))} />
    <ProfileDetailsFields value={value} options={data.options} onChange={next => setValue(old => ({ ...old, ...next }))} />
    <button className="submit-button" disabled={busy}>{busy ? 'Salvando...' : 'Salvar perfil'}</button><Link to="/profile">Cancelar</Link>
  </form></section>
}
function ProjectEditor({ data, userId, onSaved, onError }: { data: Data; userId: string; onSaved: () => Promise<void>; onError: (error: unknown) => void }) {
  const { projectId } = useParams()
  const project = data.profile.research_projects.find(item => item.id === projectId)
  if (projectId && !project) return <p role="alert">Pesquisa não encontrada.</p>
  if (project && project.creator_id !== userId) return <p role="alert">Somente o criador pode editar a pesquisa.</p>
  return <section className="content-card"><h1>{project ? 'Editar pesquisa' : 'Criar pesquisa'}</h1>
    <ProjectForm key={projectId ?? 'new'} initial={project ?? emptyProject} options={data.options} onError={onError} onSave={async value => {
      const { title, description, advisor, field_id, start_date, end_date, status } = value
      await saveProject({ title, description, advisor, field_id, start_date, end_date, status }, projectId)
      await onSaved()
    }} />
  </section>
}
export default function ProfileWorkspace({ user, onSessionEnd }: Props) {
  const [data, setData] = useState<Data | null>(null)
  const [connections, setConnections] = useState<Connection[]>([])
  const [people, setPeople] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const report = useCallback((error: unknown) => {
    if (error instanceof ApiError && error.status === 401 && error.message !== 'Senha atual incorreta') {
      onSessionEnd('Sua sessão expirou. Entre novamente.'); return
    }
    setError(getErrorMessage(error))
  }, [onSessionEnd])
  const load = useCallback(async (): Promise<Data> => {
    const [profile, options, entities] = await Promise.all([getProfile(), getOptions(), getEntities()])
    return { profile, options, entities }
  }, [])
  const reload = useCallback(async () => { setData(await load()) }, [load])
  const refreshNetwork = useCallback(async () => {
    const [nextConnections, stats] = await Promise.all([getConnections(), getNetworkStats()])
    setConnections(nextConnections); setPeople(stats.people)
  }, [])
  useEffect(() => {
    let active = true
    load().then(next => { if (active) setData(next) }).catch(error => { if (active) report(error) })
    return () => { active = false }
  }, [load, report])
  useEffect(() => {
    let active = true
    Promise.all([getConnections(), getNetworkStats()]).then(([nextConnections, stats]) => {
      if (active) { setConnections(nextConnections); setPeople(stats.people) }
    }).catch(error => { if (active) report(error) })
    return () => { active = false }
  }, [report])
  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(''), 4000)
    return () => clearTimeout(timer)
  }, [notice])
  if (!data) return <main className="app-shell"><section className={error ? 'content-card' : undefined}>
    {error ? <><p className="form-error" role="alert">{error}</p><button onClick={() => { setError(''); void reload().catch(report) }}>Tentar novamente</button><button onClick={() => onSessionEnd('Entre novamente.')}>Voltar ao login</button></> : <LoadingScreen message="Carregando seu perfil..." />}
  </section></main>
  const { profile, options, entities } = data
  async function saveEntities(entityIds: string[]) {
    setError('')
    await updateProfile({ entity_ids: entityIds, entity_memberships: profile.entity_memberships.filter(item => entityIds.includes(item.entity_id)), experiences_completed: true })
    await reload(); setNotice('Entidades atualizadas.'); navigate('/')
  }
  async function signOut() {
    setBusy(true)
    try { await logout(); onSessionEnd('Você saiu da sua conta.') } catch (error) { report(error) } finally { setBusy(false) }
  }
  return <AppSidebar profile={profile} courseName={options.courses.find(item => item.id === profile.course_id)?.name} friendCount={connections.filter(item => item.status === 'accepted').length} people={people} busy={busy} onLogout={() => void signOut()}>
    <main className="workspace-body">
      {error && <p role="alert" className="form-error">{error}<button type="button" className="dismiss" onClick={() => setError('')} aria-label="Fechar erro">×</button></p>}
      {notice && <p role="status" className="form-success">{notice}</p>}
      <Routes>
        <Route path="/" element={!profile.experiences_completed ? <Navigate to="/profile/experiences" replace /> : <GraphPage profileId={profile.id} onError={report} />} />
        <Route path="/connections" element={<ConnectionsPage meId={profile.id} connections={connections} onChanged={refreshNetwork} onError={report} />} />
        <Route path="/profile" element={<ProfilePage profile={profile} entities={entities} userId={user.id} onChanged={reload} onError={report} />} />
        <Route path="/profile/edit" element={<ProfileEditor data={data} onError={report} onSave={async value => { setError(''); await updateProfile(value); await reload(); setNotice('Perfil atualizado.'); navigate('/profile') }} />} />
        <Route path="/profile/experiences" element={<ExperienceForm key={profile.entity_ids.join(',')} profile={profile} entities={entities} onboarding={!profile.experiences_completed} onSave={saveEntities} onError={report} onSkip={async () => {
          await updateProfile({ experiences_completed: true }); await reload(); navigate('/')
        }} />} />
        <Route path="/profile/research/new" element={<ProjectEditor data={data} userId={user.id} onError={report} onSaved={async () => { await reload(); setNotice('Pesquisa adicionada ao perfil.'); navigate('/profile') }} />} />
        <Route path="/profile/research/:projectId/edit" element={<ProjectEditor data={data} userId={user.id} onError={report} onSaved={async () => { await reload(); setNotice('Pesquisa atualizada.'); navigate('/profile') }} />} />
        <Route path="/account" element={<AccountSettings onComplete={onSessionEnd} onError={report} />} />
        <Route path="/invitations" element={<InvitationForm onError={report} />} />
        <Route path="*" element={<section className="content-card"><h1>Página não encontrada</h1><Link to="/">Voltar ao início</Link></section>} />
      </Routes>
    </main>
  </AppSidebar>
}
