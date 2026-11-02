import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'
import ConnectionRequest from './ConnectionRequest'
import { requestConnection } from '../../services/GraphService'
import { ApiError } from '../../services/apiClient'
import type { Connection } from '../../types/graph'

vi.mock('../../services/GraphService', () => ({ requestConnection: vi.fn() }))
const connection: Connection = { id: 'c1', user_a_id: 'me', user_b_id: 'ana', requested_by: 'me', status: 'pending', created_at: '', accepted_at: null }
beforeEach(() => { vi.resetAllMocks(); vi.mocked(requestConnection).mockResolvedValue(connection) })
function mount(connections: Connection[] = []) {
  const onChanged = vi.fn().mockResolvedValue(undefined)
  const onError = vi.fn()
  render(<ConnectionRequest personId="ana" meId="me" connections={connections} onChanged={onChanged} onError={onError} />)
  return { onChanged, onError }
}
it('solicita conexão no painel do grafo e atualiza dados compartilhados', async () => {
  const { onChanged } = mount()
  await userEvent.click(screen.getByRole('button', { name: 'Solicitar conexão' }))
  expect(requestConnection).toHaveBeenCalledWith('ana')
  expect(await screen.findByRole('button', { name: 'Solicitação enviada' })).toBeDisabled()
  expect(onChanged).toHaveBeenCalledOnce()
})
it('não duplica envios pendentes', async () => {
  let resolve!: (value: Connection) => void
  vi.mocked(requestConnection).mockReturnValue(new Promise(done => { resolve = done }))
  mount(); await userEvent.dblClick(screen.getByRole('button', { name: 'Solicitar conexão' }))
  expect(requestConnection).toHaveBeenCalledOnce(); resolve(connection)
  await screen.findByRole('button', { name: 'Solicitação enviada' })
})
it('impede solicitar vínculo existente', () => {
  mount([connection])
  expect(screen.getByRole('button', { name: 'Solicitação enviada' })).toBeDisabled()
  expect(requestConnection).not.toHaveBeenCalled()
})
it('reconcilia conflito', async () => {
  vi.mocked(requestConnection).mockRejectedValue(new ApiError('Conexão já existe', 409))
  const { onChanged } = mount()
  await userEvent.click(screen.getByRole('button', { name: 'Solicitar conexão' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Conexão já existe')
  expect(onChanged).toHaveBeenCalledOnce()
})
it('encaminha sessão expirada ao tratamento compartilhado', async () => {
  const error = new ApiError('Sessão expirada', 401)
  vi.mocked(requestConnection).mockRejectedValue(error)
  const { onError } = mount(); await userEvent.click(screen.getByRole('button', { name: 'Solicitar conexão' }))
  await waitFor(() => expect(onError).toHaveBeenCalledWith(error))
})
