import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, expect, it, vi } from 'vitest'
import { ApiError } from '../../services/AuthService'
import ProfileWorkspace from './components/ProfileWorkspace'
import * as api from './service'
import type { Profile } from './types'

vi.mock('./service', () => ({ getProfile: vi.fn(), getOptions: vi.fn(), getEntities: vi.fn(), getProjects: vi.fn(), updateProfile: vi.fn(), saveProject: vi.fn(), changeEmail: vi.fn(), changePassword: vi.fn(), deleteAccount: vi.fn(), getPhoto: vi.fn(), uploadPhoto: vi.fn(), removePhoto: vi.fn() }))
let profile: Profile
beforeEach(() => {
  vi.clearAllMocks()
  profile = { id: '1', name: 'Pessoa', course_id: 'law', semester: 1, field_id: 'technology', bio: 'Bio anterior', photo_id: null, entity_ids: [], research_project_ids: [], experiences_completed: true }
  vi.mocked(api.getProfile).mockImplementation(async () => ({ ...profile }))
  vi.mocked(api.getOptions).mockResolvedValue({ courses: [{ id: 'law', name: 'Direito' }], fields: [{ id: 'technology', name: 'Tecnologia' }], semesters: [1,2,3,4,5,6,7,8], statuses: ['planned'] })
  vi.mocked(api.getEntities).mockResolvedValue([{ id: 'insper-code', name: 'Insper Code' }])
  vi.mocked(api.getProjects).mockResolvedValue([])
  vi.mocked(api.updateProfile).mockImplementation(async changes => { profile = { ...profile, ...changes }; return profile })
})
function mount(path: string, onSessionEnd = vi.fn()) {
  render(<MemoryRouter initialEntries={[path]}><ProfileWorkspace user={{ id: '1', email: 'a@insper.edu.br' }} onSessionEnd={onSessionEnd} /></MemoryRouter>)
  return onSessionEnd
}
it('salva bio e volta ao próprio perfil', async () => {
  const user = userEvent.setup()
  mount('/profile/edit')
  const bio = await screen.findByLabelText('Bio')
  await user.clear(bio); await user.type(bio, 'Nova bio')
  await user.click(screen.getByRole('button', { name: 'Salvar perfil' }))
  await screen.findByRole('heading', { name: 'Pessoa' })
  expect(screen.getByText('Nova bio')).toBeInTheDocument()
  expect(api.updateProfile).toHaveBeenCalledWith({ name: 'Pessoa', course_id: 'law', semester: 1, field_id: 'technology', bio: 'Nova bio' })
  expect(screen.queryByRole('link', { name: /pessoas|buscar/i })).not.toBeInTheDocument()
})
it('etapa opcional pode ser pulada e fica persistida', async () => {
  profile.experiences_completed = false
  mount('/')
  await userEvent.click(await screen.findByRole('button', { name: 'Pular por enquanto' }))
  expect(await screen.findByRole('heading', { name: 'Bem-vindo, Pessoa' })).toBeInTheDocument()
  expect(api.updateProfile).toHaveBeenCalledWith({ experiences_completed: true })
})
it('sessão expirada retorna ao login pelo callback', async () => {
  vi.mocked(api.getProfile).mockRejectedValue(new ApiError('Autenticação inválida', 401))
  const end = mount('/profile')
  await waitFor(() => expect(end).toHaveBeenCalledWith('Sua sessão expirou. Entre novamente.'))
})
it('senha atual incorreta não limpa uma sessão válida', async () => {
  const user = userEvent.setup()
  vi.mocked(api.changeEmail).mockRejectedValue(new ApiError('Senha atual incorreta', 401))
  const end = mount('/account')
  await user.type(await screen.findByLabelText('Senha atual para alterar e-mail'), 'errada')
  await user.type(screen.getByLabelText('Novo e-mail institucional'), 'new@insper.edu.br')
  await user.click(screen.getByRole('button', { name: 'Alterar e-mail' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Senha atual incorreta')
  expect(end).not.toHaveBeenCalled()
})
it('não permite interface para consultar perfil alheio por id', async () => {
  mount('/profiles/another-user')
  expect(await screen.findByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument()
})
