import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, expect, it, vi } from 'vitest'
import AccountSettings from './AccountSettings'
import ExperienceForm from './ExperienceForm'
import PhotoPanel from './PhotoPanel'
import ProjectForm from './ProjectForm'
import ProfileFields from './ProfileFields'
import { emptyProfile, emptyProject, type Profile, type ProfileOptions } from '../types'
import * as api from '../service'

vi.mock('../service', () => ({ changeEmail: vi.fn(), changePassword: vi.fn(), deleteAccount: vi.fn(), getPhoto: vi.fn(), uploadPhoto: vi.fn(), removePhoto: vi.fn() }))
const options: ProfileOptions = { courses: [{ id: 'law', name: 'Direito' }], fields: [{ id: 'technology', name: 'Tecnologia' }], semesters: [1,2,3,4,5,6,7,8], statuses: ['planned', 'in_progress', 'completed', 'cancelled'] }
const profile: Profile = { ...emptyProfile, id: '1', name: 'Pessoa', photo_id: null, entity_ids: [], research_project_ids: [], experiences_completed: false }
beforeEach(() => { vi.clearAllMocks() })

it('campos de cadastro exigem bio e não incluem interesses', () => {
  render(<ProfileFields value={emptyProfile} options={options} onChange={vi.fn()} />)
  expect(screen.getByLabelText('Bio')).toBeRequired()
  expect(screen.queryByLabelText(/interesses/i)).not.toBeInTheDocument()
  expect(screen.getAllByRole('option', { name: /semestre/ })).toHaveLength(9)
})
it('só exclui a conta após senha e confirmação explícita', async () => {
  const user = userEvent.setup(), onComplete = vi.fn()
  vi.mocked(api.deleteAccount).mockResolvedValue()
  render(<AccountSettings onComplete={onComplete} onError={vi.fn()} />)
  const remove = screen.getByRole('button', { name: 'Excluir minha conta' })
  expect(remove).toBeDisabled()
  await user.type(screen.getByLabelText('Senha atual para excluir conta'), 'senha1234')
  await user.click(screen.getByRole('checkbox'))
  await user.click(remove)
  await waitFor(() => expect(api.deleteAccount).toHaveBeenCalledWith('senha1234'))
  expect(onComplete).toHaveBeenCalledWith('Sua conta foi excluída.')
})
it('troca e-mail e solicita novo login após sucesso', async () => {
  const user = userEvent.setup(), onComplete = vi.fn()
  vi.mocked(api.changeEmail).mockResolvedValue()
  render(<AccountSettings onComplete={onComplete} onError={vi.fn()} />)
  await user.type(screen.getByLabelText('Senha atual para alterar e-mail'), 'senha1234')
  await user.type(screen.getByLabelText('Novo e-mail institucional'), 'new@insper.edu.br')
  await user.click(screen.getByRole('button', { name: 'Alterar e-mail' }))
  await waitFor(() => expect(api.changeEmail).toHaveBeenCalledWith('senha1234', 'new@insper.edu.br'))
  expect(onComplete).toHaveBeenCalled()
})
it('senhas divergentes não são enviadas e erro HTTP é apresentado ao pai', async () => {
  const user = userEvent.setup(), onError = vi.fn()
  render(<AccountSettings onComplete={vi.fn()} onError={onError} />)
  await user.type(screen.getByLabelText('Senha atual para alterar senha'), 'senha1234')
  await user.type(screen.getByLabelText('Nova senha'), 'outrasenha')
  await user.type(screen.getByLabelText('Confirme a nova senha'), 'diferente')
  await user.click(screen.getByRole('button', { name: 'Alterar senha' }))
  expect(screen.getByRole('alert')).toHaveTextContent('não coincidem')
  expect(api.changePassword).not.toHaveBeenCalled()
  await user.clear(screen.getByLabelText('Confirme a nova senha'))
  await user.type(screen.getByLabelText('Confirme a nova senha'), 'outrasenha')
  vi.mocked(api.changePassword).mockRejectedValue(new Error('Senha atual incorreta'))
  await user.click(screen.getByRole('button', { name: 'Alterar senha' }))
  await waitFor(() => expect(onError).toHaveBeenCalled())
})
it('salva experiências por id e permite pular', async () => {
  const user = userEvent.setup(), onSave = vi.fn().mockResolvedValue(undefined), onSkip = vi.fn().mockResolvedValue(undefined)
  render(<MemoryRouter><ExperienceForm profile={profile} entities={[{ id: 'code', name: 'Insper Code' }]} projects={[]} onboarding onSave={onSave} onSkip={onSkip} onError={vi.fn()} /></MemoryRouter>)
  await user.click(screen.getByLabelText('Insper Code'))
  await user.click(screen.getByRole('button', { name: 'Salvar experiências' }))
  expect(onSave).toHaveBeenCalledWith(['code'], [])
  await user.click(screen.getByRole('button', { name: 'Pular por enquanto' }))
  expect(onSkip).toHaveBeenCalled()
})
it('formulário de pesquisa envia os dados acadêmicos', async () => {
  const user = userEvent.setup(), onSave = vi.fn().mockResolvedValue(undefined)
  render(<ProjectForm initial={{ ...emptyProject, title: 'Pesquisa', description: 'Descrição', advisor: 'Professora', field_id: 'technology', start_date: '2026-01-01' }} options={options} onSave={onSave} onError={vi.fn()} />)
  await user.click(screen.getByRole('button', { name: 'Salvar pesquisa' }))
  expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ title: 'Pesquisa', end_date: null, status: 'planned' }))
})
it('foto valida o arquivo e libera a URL temporária', async () => {
  const user = userEvent.setup(), onError = vi.fn(), onChanged = vi.fn().mockResolvedValue(undefined)
  vi.mocked(api.getPhoto).mockResolvedValue(new Blob(['png'], { type: 'image/png' }))
  vi.mocked(api.uploadPhoto).mockResolvedValue()
  const create = vi.fn().mockReturnValue('blob:profile'), revoke = vi.fn()
  vi.stubGlobal('URL', class extends URL { static createObjectURL = create; static revokeObjectURL = revoke })
  const { unmount } = render(<PhotoPanel photoId="photo" onChanged={onChanged} onError={onError} />)
  await screen.findByAltText('Sua foto de perfil')
  const input = screen.getByLabelText('Adicionar ou trocar foto')
  await user.upload(input, new File(['png'], 'avatar.png', { type: 'image/png' }))
  await waitFor(() => expect(onChanged).toHaveBeenCalled())
  const large = new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' })
  await user.upload(input, large)
  expect(onError).toHaveBeenCalled()
  unmount()
  expect(revoke).toHaveBeenCalledWith('blob:profile')
})
