import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useNavigate, useParams } from 'react-router'
import { ApiError, logout, type AuthUser } from '../services/AuthService'
import { getErrorMessage } from '../services/apiClient'
import { getEntities, getOptions, getProfile, getProjects, saveProject, updateProfile } from '../services/ProfileService'
import { emptyProject, statusLabels, type Option, type Profile, type ProfileInput, type ProfileOptions, type Project } from '../types/profile'
import ProfileFields from '../components/ProfileFields'
import PhotoPanel from '../components/PhotoPanel'
import AccountSettings from '../components/AccountSettings'
import ExperienceForm from '../components/ExperienceForm'
import ProjectForm from '../components/ProjectForm'
import InvitationForm from '../components/InvitationForm'

interface Data { profile: Profile; options: ProfileOptions; entities: Option[]; projects: Project[] }
interface Props { user: AuthUser; onSessionEnd: (message: string) => void }
function ProfileEditor({ data, onSave, onError }: { data: Data; onSave: (value: ProfileInput) => Promise<void>; onError: (error: unknown) => void }) {
  const [value, setValue] = useState<ProfileInput>({ name: data.profile.name, course_id: data.profile.course_id, semester: data.profile.semester, field_id: data.profile.field_id, bio: data.profile.bio })
  const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true)
    try { await onSave(value) } catch (error) { onError(error) } finally { setBusy(false) }
  }
  return <section className="content-card"><h1>Editar perfil</h1><form className="auth-form" onSubmit={submit} aria-busy={busy}>
    <ProfileFields value={value} options={data.options} onChange={setValue} />
    <button className="submit-button" disabled={busy}>{busy ? 'Salvando...' : 'Salvar perfil'}</button><Link to="/profile">Cancelar</Link>
  </form></section>
}
function ProjectEditor({ data, userId, onSaved, onError }: { data: Data; userId: string; onSaved: () => Promise<void>; onError: (error: unknown) => void }) {
  const { projectId } = useParams()
  const project = data.projects.find(item => item.id === projectId)
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
    const [profile, options, entities, projects] = await Promise.all([getProfile(), getOptions(), getEntities(), getProjects()])
    return { profile, options, entities, projects }
  }, [])
  const reload = useCallback(async () => { setData(await load()) }, [load])
  useEffect(() => {
    let active = true
    load().then(next => { if (active) setData(next) }).catch(error => { if (active) report(error) })
    return () => { active = false }
  }, [load, report])
  if (!data) return <main className="app-shell"><section className="content-card">
    {error ? <><p className="form-error" role="alert">{error}</p><button onClick={() => { setError(''); void reload().catch(report) }}>Tentar novamente</button><button onClick={() => onSessionEnd('Entre novamente.')}>Voltar ao login</button></> : <p role="status">Carregando seu perfil...</p>}
  </section></main>
  const { profile, options, entities, projects } = data
  async function saveExperiences(entityIds: string[], projectIds: string[]) {
    setError('')
    await updateProfile({ entity_ids: entityIds, research_project_ids: projectIds, experiences_completed: true })
    await reload(); setNotice('Experiências atualizadas.'); navigate('/profile')
  }
  return <main className="workspace">
    <header className="workspace-header"><Link className="brand" to="/">GrafoNet</Link>
      <nav aria-label="Navegação principal">
        <NavLink to="/" end>Início</NavLink><NavLink to="/profile">Meu perfil</NavLink><NavLink to="/research-projects">Pesquisas</NavLink><NavLink to="/invitations">Convites</NavLink><NavLink to="/account">Conta</NavLink>
        <button className="secondary-button" disabled={busy} onClick={async () => {
          setBusy(true)
          try { await logout(); onSessionEnd('Você saiu da sua conta.') } catch (error) { report(error) } finally { setBusy(false) }
        }}>{busy ? 'Saindo...' : 'Sair'}</button>
      </nav>
    </header>
    <div className="workspace-body">
      {error && <p role="alert" className="form-error">{error}<button type="button" className="dismiss" onClick={() => setError('')} aria-label="Fechar erro">×</button></p>}
      {notice && <p role="status" className="form-success">{notice}</p>}
      <Routes>
        <Route path="/" element={!profile.experiences_completed ? <Navigate to="/profile/experiences" replace /> : <section className="content-card"><h1>Bem-vindo, {profile.name}</h1><p>Seu espaço no GrafoNet.</p><Link to="/profile">Acessar meu perfil</Link></section>} />
        <Route path="/profile" element={<section className="content-card"><h1>{profile.name}</h1>
          <PhotoPanel photoId={profile.photo_id} onChanged={reload} onError={report} />
          <dl><dt>Curso</dt><dd>{options.courses.find(item => item.id === profile.course_id)?.name}</dd><dt>Semestre</dt><dd>{profile.semester}º</dd><dt>Área de atuação</dt><dd>{options.fields.find(item => item.id === profile.field_id)?.name}</dd></dl>
          <h2>Bio</h2><p className="preserve-lines">{profile.bio}</p>
          <h2>Entidades</h2>{profile.entity_ids.length ? <ul>{entities.filter(item => profile.entity_ids.includes(item.id)).map(item => <li key={item.id}>{item.name}</li>)}</ul> : <p>Nenhuma entidade adicionada.</p>}
          <h2>Iniciação científica</h2>{profile.research_project_ids.length ? <ul>{projects.filter(item => profile.research_project_ids.includes(item.id)).map(item => <li key={item.id}>{item.title}</li>)}</ul> : <p>Nenhuma pesquisa adicionada.</p>}
          <div className="actions"><Link to="/profile/edit">Editar perfil</Link><Link to="/profile/experiences">Editar experiências</Link></div>
        </section>} />
        <Route path="/profile/edit" element={<ProfileEditor data={data} onError={report} onSave={async value => { setError(''); await updateProfile(value); await reload(); setNotice('Perfil atualizado.'); navigate('/profile') }} />} />
        <Route path="/profile/experiences" element={<ExperienceForm key={profile.research_project_ids.join(',') + profile.entity_ids.join(',')} profile={profile} entities={entities} projects={projects} onboarding={!profile.experiences_completed} onSave={saveExperiences} onError={report} onSkip={async () => {
          await updateProfile({ experiences_completed: true }); await reload(); navigate('/')
        }} />} />
        <Route path="/research-projects" element={<section className="content-card"><h1>Projetos de pesquisa</h1><Link to="/research-projects/new">Criar pesquisa</Link>
          {!projects.length && <p>Nenhuma pesquisa cadastrada.</p>}
          {projects.map(project => <article className="project-card" key={project.id}><h2>{project.title}</h2><p className="preserve-lines">{project.description}</p>
            <p>Orientador: {project.advisor}</p><p>{options.fields.find(item => item.id === project.field_id)?.name} · {statusLabels[project.status]}</p>
            <p>Início: {project.start_date}{project.end_date ? ` · Fim: ${project.end_date}` : ''}</p>
            {project.creator_id === user.id && <Link to={`/research-projects/${project.id}/edit`}>Editar pesquisa</Link>}
            {project.creator_id === null && <p>Criador removido</p>}
            {!profile.research_project_ids.includes(project.id) && <button className="secondary-button" disabled={busy} onClick={async () => {
              setBusy(true)
              try { await updateProfile({ research_project_ids: [...profile.research_project_ids, project.id] }); await reload(); setNotice('Pesquisa adicionada ao perfil.') } catch (error) { report(error) } finally { setBusy(false) }
            }}>Adicionar ao meu perfil</button>}
          </article>)}
        </section>} />
        <Route path="/research-projects/new" element={<ProjectEditor data={data} userId={user.id} onError={report} onSaved={async () => { await reload(); setNotice('Pesquisa criada e adicionada ao perfil.'); navigate(profile.experiences_completed ? '/research-projects' : '/profile/experiences') }} />} />
        <Route path="/research-projects/:projectId/edit" element={<ProjectEditor data={data} userId={user.id} onError={report} onSaved={async () => { await reload(); setNotice('Pesquisa atualizada.'); navigate('/research-projects') }} />} />
        <Route path="/account" element={<AccountSettings onComplete={onSessionEnd} onError={report} />} />
        <Route path="/invitations" element={<InvitationForm onError={report} />} />
        <Route path="*" element={<section className="content-card"><h1>Página não encontrada</h1><Link to="/">Voltar ao início</Link></section>} />
      </Routes>
    </div>
  </main>
}
