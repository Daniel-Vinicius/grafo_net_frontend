import { AxiosError } from 'axios'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'
import { ApiError } from '../services/AuthService'
import OrientationsPage from './OrientationsPage'
import * as api from '../services/ResearchService'
import type { ReceivedParticipation } from '../types/profile'

vi.mock('../services/ResearchService', () => ({ getProjects: vi.fn(), getParticipations: vi.fn(), reviewParticipation: vi.fn() }))
const item: ReceivedParticipation = { profile_id: 'student', profile_name: 'Ana', participation: { id: 'participation-1', project_id: 'project-1', advisor_user_id: 'professor', role: 'Bolsista', start_date: '2026-01-01', end_date: null, status: 'pending' } }
beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(api.getProjects).mockResolvedValue([])
  vi.mocked(api.getParticipations).mockResolvedValue([item])
  vi.mocked(api.reviewParticipation).mockResolvedValue(undefined)
})
function mount() {
  const onError = vi.fn()
  render(<OrientationsPage onError={onError} />)
  return onError
}
it.each([['Confirmar', 'confirmed', 'Orientação confirmada.'], ['Rejeitar', 'rejected', 'Orientação rejeitada.']] as const)('revisa com %s e atualiza pendências', async (button, decision, notice) => {
  vi.mocked(api.getParticipations).mockResolvedValueOnce([item]).mockResolvedValue([])
  mount(); await userEvent.click(await screen.findByRole('button', { name: button }))
  expect(api.reviewParticipation).toHaveBeenCalledWith('participation-1', decision)
  expect(await screen.findByText('Nenhuma orientação nesta situação.')).toBeInTheDocument()
  expect(screen.getByText(notice)).toBeInTheDocument()
})
it('bloqueia decisões duplicadas durante envio', async () => {
  let resolve!: () => void
  vi.mocked(api.reviewParticipation).mockReturnValue(new Promise(done => { resolve = done }))
  mount(); await userEvent.dblClick(await screen.findByRole('button', { name: 'Confirmar' }))
  expect(api.reviewParticipation).toHaveBeenCalledTimes(1)
  expect(screen.getByRole('button', { name: 'Rejeitar' })).toBeDisabled()
  expect(screen.getByLabelText('Situação')).toBeDisabled()
  resolve()
  await waitFor(() => expect(screen.getByLabelText('Situação')).toBeEnabled())
})
it('consulta histórico sem ações de revisão', async () => {
  mount(); await screen.findByText('Ana')
  vi.mocked(api.getParticipations).mockResolvedValue([{ ...item, participation: { ...item.participation, status: 'confirmed' } }])
  await userEvent.selectOptions(screen.getByLabelText('Situação'), 'confirmed')
  await screen.findByText('Situação: Confirmadas')
  expect(api.getParticipations).toHaveBeenLastCalledWith('confirmed', expect.any(AbortSignal))
  expect(screen.queryByRole('button', { name: 'Confirmar' })).not.toBeInTheDocument()
  vi.mocked(api.getParticipations).mockResolvedValue([])
  await userEvent.selectOptions(screen.getByLabelText('Situação'), 'rejected')
  await screen.findByText('Nenhuma orientação nesta situação.')
  expect(api.getParticipations).toHaveBeenLastCalledWith('rejected', expect.any(AbortSignal))
})
it('informa conflito e atualiza a lista', async () => {
  vi.mocked(api.getParticipations).mockResolvedValueOnce([item]).mockResolvedValue([])
  vi.mocked(api.reviewParticipation).mockRejectedValue(new ApiError('Solicitação já revisada', 409))
  mount(); await userEvent.click(await screen.findByRole('button', { name: 'Rejeitar' }))
  expect(await screen.findByText('Nenhuma orientação nesta situação.')).toBeInTheDocument()
  expect(screen.getByText('Solicitação já revisada')).toBeInTheDocument()
})
it('preserva pendência e permite repetir após falha de revisão', async () => {
  vi.mocked(api.reviewParticipation).mockRejectedValueOnce(new AxiosError('offline')).mockResolvedValue(undefined)
  mount(); await userEvent.click(await screen.findByRole('button', { name: 'Confirmar' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível conectar')
  await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
  expect(await screen.findByText('Orientação confirmada.')).toBeInTheDocument()
})
it('permite repetir consulta após falha temporária', async () => {
  vi.mocked(api.getParticipations).mockRejectedValueOnce(new AxiosError('offline')).mockResolvedValue([])
  mount(); await userEvent.click(await screen.findByRole('button', { name: 'Tentar novamente' }))
  expect(await screen.findByText('Nenhuma orientação nesta situação.')).toBeInTheDocument()
})
it('mostra erro de permissão sem encerrar sessão', async () => {
  vi.mocked(api.getParticipations).mockRejectedValue(new ApiError('Somente professores recebem orientações', 403))
  const onError = mount()
  expect(await screen.findByRole('alert')).toHaveTextContent('Somente professores')
  expect(onError).not.toHaveBeenCalled()
})
it('propaga sessão expirada durante revisão', async () => {
  const error = new ApiError('Sessão expirada', 401)
  vi.mocked(api.reviewParticipation).mockRejectedValue(error)
  const onError = mount(); await userEvent.click(await screen.findByRole('button', { name: 'Confirmar' }))
  await waitFor(() => expect(onError).toHaveBeenCalledWith(error))
})
it('ignora resposta de filtro anterior', async () => {
  let resolve!: (items: ReceivedParticipation[]) => void
  vi.mocked(api.getParticipations).mockReturnValueOnce(new Promise(done => { resolve = done })).mockResolvedValue([])
  mount(); await userEvent.selectOptions(screen.getByLabelText('Situação'), 'rejected')
  await screen.findByText('Nenhuma orientação nesta situação.'); resolve([item])
  await waitFor(() => expect(screen.queryByText('Ana')).not.toBeInTheDocument())
})
