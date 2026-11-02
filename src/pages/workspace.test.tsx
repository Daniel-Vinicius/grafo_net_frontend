import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, expect, it, vi } from 'vitest'
import ProfileWorkspace from './ProfileWorkspace'
import * as profileApi from '../services/ProfileService'
import * as researchApi from '../services/ResearchService'
import { getConnections, getNetworkStats } from '../services/GraphService'
import type { Profile } from '../types/profile'

vi.mock('../services/ProfileService', () => ({ getProfile: vi.fn(), getOptions: vi.fn(), getEntities: vi.fn() }))
vi.mock('../services/ResearchService', () => ({ getProjects: vi.fn(), getParticipations: vi.fn(), reviewParticipation: vi.fn() }))
vi.mock('../services/GraphService', () => ({ getConnections: vi.fn(), getNetworkStats: vi.fn() }))
let profile: Profile
beforeEach(() => {
  vi.resetAllMocks()
  profile = { id: '1', name: 'Professor', type: 'professor', course_id: 'law', course: 'Direito', field_id: '', field: '', semester: 1, bio: '', entry_year: null, entry_semester: null, class_group: '', role: '', company: '', photo_id: null, photo_url: null, entity_ids: [], research_project_ids: [], experiences_completed: true, entities: [], research_projects: [], experiences: [], entity_memberships: [] }
  vi.mocked(profileApi.getProfile).mockImplementation(async () => profile)
  vi.mocked(profileApi.getOptions).mockResolvedValue({ courses: [], fields: [], semesters: [], statuses: [], types: [] })
  vi.mocked(profileApi.getEntities).mockResolvedValue([])
  vi.mocked(getConnections).mockResolvedValue([])
  vi.mocked(getNetworkStats).mockResolvedValue({ people: 2 })
  vi.mocked(researchApi.getProjects).mockResolvedValue([{ id: 'p1', creator_id: '1', title: 'Pesquisa X', advisor: 'Professor', description: 'Descrição', field_id: 'technology', start_date: '2026-01-01', end_date: null, status: 'in_progress' }])
  vi.mocked(researchApi.getParticipations).mockResolvedValue([{ profile_id: 's1', profile_name: 'Ana', participation: { id: 'r1', project_id: 'p1', advisor_user_id: '1', role: 'Bolsista', start_date: '2026-01-01', end_date: null, status: 'pending' } }])
})
function mount() {
  render(<MemoryRouter initialEntries={['/orientations']}><ProfileWorkspace user={{ id: '1', email: 'a@insper.edu.br' }} onSessionEnd={vi.fn()} /></MemoryRouter>)
}
it('permite professor consultar orientações com título do catálogo', async () => {
  mount()
  expect(await screen.findByText('Pesquisa X')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Orientações' })).toHaveAttribute('href', '/orientations')
  expect(screen.getByRole('link', { name: 'Pessoas' })).toHaveAttribute('href', '/people')
  expect(researchApi.getParticipations).toHaveBeenCalledWith('pending', expect.any(AbortSignal))
})
it('bloqueia acesso direto e oculta navegação para aluno', async () => {
  profile.type = 'aluno'; mount()
  expect(await screen.findByRole('alert')).toHaveTextContent('Somente professores recebem orientações.')
  expect(screen.queryByRole('link', { name: 'Orientações' })).not.toBeInTheDocument()
  expect(researchApi.getParticipations).not.toHaveBeenCalled()
  expect(researchApi.getProjects).not.toHaveBeenCalled()
})
