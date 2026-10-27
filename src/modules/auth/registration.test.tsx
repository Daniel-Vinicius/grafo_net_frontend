import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'
import AuthPage from '../../pages/AuthPage'
import { register } from '../../services/AuthService'
import { getOptions } from './service'

vi.mock('./service', () => ({ getOptions: vi.fn() }))
vi.mock('../../services/AuthService', async importOriginal => {
  const actual = await importOriginal<typeof import('../../services/AuthService')>()
  return { ...actual, register: vi.fn(), login: vi.fn() }
})
beforeEach(() => {
  vi.clearAllMocks()
  window.history.replaceState(null, '', '/register?token=invite-test')
  vi.mocked(getOptions).mockResolvedValue({ courses: [{ id: 'law', name: 'Direito' }], fields: [{ id: 'technology', name: 'Tecnologia' }], semesters: [1,2,3,4,5,6,7,8], statuses: ['planned'] })
})
it('cadastro envia Profile completo, limpa convite e pede login', async () => {
  const user = userEvent.setup()
  vi.mocked(register).mockResolvedValue({ id: '1', email: 'a@insper.edu.br' })
  render(<AuthPage notice={null} onAuthenticated={vi.fn()} />)
  await screen.findByLabelText('Nome')
  await user.type(screen.getByLabelText('Nome'), 'Pessoa')
  await user.selectOptions(screen.getByLabelText('Curso'), 'law')
  await user.selectOptions(screen.getByLabelText('Semestre'), '2')
  await user.selectOptions(screen.getByLabelText('Área de atuação'), 'technology')
  await user.type(screen.getByLabelText('Bio'), 'Minha bio')
  await user.type(screen.getByLabelText('E-mail'), 'a@insper.edu.br')
  await user.type(screen.getByLabelText('Senha'), 'senha1234')
  await user.click(screen.getByRole('button', { name: 'Criar conta' }))
  await waitFor(() => expect(register).toHaveBeenCalledWith({
    email: 'a@insper.edu.br', password: 'senha1234', invite_token: 'invite-test',
    profile: { name: 'Pessoa', course_id: 'law', semester: 2, field_id: 'technology', bio: 'Minha bio' },
  }))
  expect(await screen.findByText('Cadastro concluído. Agora você já pode entrar.')).toBeInTheDocument()
  expect(window.location.search).toBe('')
})
it('falha ao carregar catálogo permite tentar novamente', async () => {
  vi.mocked(getOptions).mockRejectedValueOnce(new Error('Catálogo indisponível'))
  render(<AuthPage notice={null} onAuthenticated={vi.fn()} />)
  expect(await screen.findByRole('alert')).toHaveTextContent('Catálogo indisponível')
  expect(screen.getByRole('button', { name: 'Criar conta' })).toBeDisabled()
  await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
  expect(await screen.findByLabelText('Curso')).toBeInTheDocument()
})
