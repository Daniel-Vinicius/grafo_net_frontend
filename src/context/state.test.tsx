import { StrictMode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'
import { AuthProvider } from './state'
import { useAuth } from './authContext'

const fetchMock = vi.fn()
function Probe() {
  const { user, sessionPending, loading, error, refreshMe, clearSession } = useAuth()
  return <><p>{user ? user.email : sessionPending ? 'Pendente' : 'Sem sessão'}</p>{error && <p role="alert">{error}</p>}
    <button disabled={loading} onClick={() => void refreshMe()}>Revalidar</button>
    <button onClick={clearSession}>Limpar</button></>
}
beforeEach(() => { localStorage.clear(); fetchMock.mockReset(); vi.stubGlobal('fetch', fetchMock) })
function mount() { render(<StrictMode><AuthProvider><Probe /></AuthProvider></StrictMode>) }
function response(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status }) }
it('restaura sessão persistida usando /auth/me e o mesmo Bearer', async () => {
  localStorage.setItem('grafonet.access_token', 'saved-token')
  fetchMock.mockResolvedValue(response({ id: '1', email: 'a@insper.edu.br' }))
  mount()
  expect(await screen.findByText('a@insper.edu.br')).toBeInTheDocument()
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(fetchMock.mock.calls[0][0]).toBe('/auth/me')
  expect(fetchMock.mock.calls[0][1].headers.get('Authorization')).toBe('Bearer saved-token')
  await userEvent.click(screen.getByRole('button', { name: 'Limpar' }))
  expect(localStorage.getItem('grafonet.access_token')).toBeNull()
  expect(screen.getByText('Sem sessão')).toBeInTheDocument()
})
it('401 na restauração apaga token inválido e sai do estado pendente', async () => {
  localStorage.setItem('grafonet.access_token', 'expired')
  fetchMock.mockResolvedValue(response({ message: 'Autenticação inválida' }, 401))
  mount()
  expect(await screen.findByText('Sem sessão')).toBeInTheDocument()
  expect(localStorage.length).toBe(0)
})
it('falha temporária preserva token e permite revalidar', async () => {
  localStorage.setItem('grafonet.access_token', 'saved-token')
  fetchMock.mockResolvedValueOnce(response({ message: 'Indisponível' }, 503))
    .mockResolvedValueOnce(response({ id: '1', email: 'a@insper.edu.br' }))
  mount()
  await screen.findByRole('alert')
  expect(localStorage.length).toBe(1)
  expect(screen.getByText('Pendente')).toBeInTheDocument()
  await waitFor(() => expect(screen.getByRole('button', { name: 'Revalidar' })).toBeEnabled())
  await userEvent.click(screen.getByRole('button', { name: 'Revalidar' }))
  expect(await screen.findByText('a@insper.edu.br')).toBeInTheDocument()
})
