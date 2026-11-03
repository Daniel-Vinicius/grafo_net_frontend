import { AxiosError } from 'axios'
import type { Profile } from '../types/profile'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, expect, it, vi } from 'vitest'
import { ApiError } from '../services/AuthService'
import PeoplePage from './PeoplePage'
import PathPage from './PathPage'
import * as api from '../services/GraphService'
import type { Connection, PathResult, SearchResult } from '../types/graph'

vi.mock('../services/GraphService', () => ({ searchPeople: vi.fn(), getConnections: vi.fn(), requestConnection: vi.fn(), getPath: vi.fn() }))
const ana: Profile = { id: 'ana', name: 'Ana', type: 'aluno', course_id: 'law', course: 'Direito', field_id: '', field: '', semester: 1, bio: 'Bio Ana', entry_year: null, entry_semester: null, class_group: '', role: '', company: '', entities: [], research_projects: [], experiences: [], entity_memberships: [], photo_url: null, photo_id: null, entity_ids: [], research_project_ids: [], experiences_completed: true }
const bia = { ...ana, id: 'bia', name: 'Bia' }
const carla = { ...ana, id: 'carla', name: 'Carla' }
const connection: Connection = { id: 'c1', user_a_id: 'me', user_b_id: 'ana', requested_by: 'me', status: 'pending', created_at: '', accepted_at: null }
function result(name = 'Ana'): SearchResult {
  return { results: [{ profile_id: 'ana', similarity: 0.9, cost: null, path: null }], graph: { nodes: [{ ...ana, name }], edges: [] }, total: 1, mode: 'proximity', limit: 10, offset: 0, indexing_pending: 0 }
}
const direct: PathResult = { path: { user_ids: ['ana', 'bia'], steps: [{ order: 1, edge_id: 'e', source: 'ana', target: 'bia' }], cost: { contextual_edges: 0, hops: 1 } }, graph: { nodes: [bia, ana], edges: [{ id: 'e', source: 'bia', target: 'ana', type: 'close', context: {} }] } }
beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(api.searchPeople).mockResolvedValue(result())
  vi.mocked(api.getConnections).mockResolvedValue([])
  vi.mocked(api.requestConnection).mockResolvedValue(connection)
  vi.mocked(api.getPath).mockResolvedValue(direct)
})
function mount(path = '/people') {
  const onError = vi.fn()
  render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/people" element={<PeoplePage userId="me" onError={onError} />} /><Route path="/people/:personId/path" element={<PathPage onError={onError} />} /></Routes></MemoryRouter>)
  return onError
}
async function search(text = 'tecnologia') {
  await userEvent.type(screen.getByLabelText('O que você procura?'), text)
  await userEvent.click(screen.getByRole('button', { name: 'Buscar pessoas' }))
  await screen.findByRole('heading', { name: 'Ana' })
}
it('busca pessoas e solicita conexão sem duplicar o envio', async () => {
  let resolve!: (value: Connection) => void
  vi.mocked(api.requestConnection).mockReturnValue(new Promise(done => { resolve = done }))
  mount(); await search()
  expect(api.searchPeople).toHaveBeenCalledWith({ query: 'tecnologia', mode: 'proximity', limit: 10, offset: 0 }, expect.any(AbortSignal))
  const button = screen.getByRole('button', { name: 'Solicitar conexão' })
  await userEvent.dblClick(button)
  expect(api.requestConnection).toHaveBeenCalledTimes(1)
  expect(api.requestConnection).toHaveBeenCalledWith('ana')
  resolve(connection)
  expect(await screen.findByRole('button', { name: 'Solicitação enviada' })).toBeDisabled()
})
it.each([
  ['accepted', 'me', 'Conexão confirmada'],
  ['pending', 'me', 'Solicitação enviada'],
  ['pending', 'ana', 'Solicitação recebida'],
] as const)('representa vínculo %s de %s', async (status, requested_by, label) => {
  vi.mocked(api.getConnections).mockResolvedValue([{ ...connection, status, requested_by }])
  mount(); await search()
  expect(screen.getByRole('button', { name: label })).toBeDisabled()
  expect(api.requestConnection).not.toHaveBeenCalled()
})
it('reconcilia conexão criada em outra sessão após conflito', async () => {
  vi.mocked(api.getConnections).mockResolvedValueOnce([]).mockResolvedValue([connection])
  vi.mocked(api.requestConnection).mockRejectedValue(new ApiError('Conexão já existe', 409))
  mount(); await search(); await userEvent.click(screen.getByRole('button', { name: 'Solicitar conexão' }))
  expect(await screen.findByRole('button', { name: 'Solicitação enviada' })).toBeDisabled()
  expect(screen.getByText('Conexão já existe')).toBeInTheDocument()
})
it('mantém opção de solicitar após falha temporária', async () => {
  vi.mocked(api.requestConnection).mockRejectedValueOnce(new AxiosError('offline')).mockResolvedValue(connection)
  mount(); await search(); await userEvent.click(screen.getByRole('button', { name: 'Solicitar conexão' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível conectar')
  await userEvent.click(screen.getByRole('button', { name: 'Solicitar conexão' }))
  expect(await screen.findByRole('button', { name: 'Solicitação enviada' })).toBeDisabled()
})
it('mostra busca vazia e indexação pendente', async () => {
  vi.mocked(api.searchPeople).mockResolvedValue({ ...result(), results: [], total: 0, indexing_pending: 2 })
  mount(); await userEvent.type(screen.getByLabelText('O que você procura?'), 'teste'); await userEvent.click(screen.getByRole('button', { name: 'Buscar pessoas' }))
  expect(await screen.findByText('Nenhuma pessoa encontrada.')).toBeInTheDocument()
  expect(screen.getByText(/aguardam indexação/)).toBeInTheDocument()
})
it('pagina preservando consulta e ordenação', async () => {
  vi.mocked(api.searchPeople).mockResolvedValue({ ...result(), total: 12 })
  mount(); await userEvent.selectOptions(screen.getByLabelText('Ordenar por'), 'relevance'); await search()
  await userEvent.click(screen.getByRole('button', { name: 'Próxima' }))
  await waitFor(() => expect(api.searchPeople).toHaveBeenLastCalledWith({ query: 'tecnologia', mode: 'relevance', limit: 10, offset: 10 }, expect.any(AbortSignal)))
})
it('ignora resposta antiga de busca', async () => {
  let resolve!: (value: SearchResult) => void
  vi.mocked(api.searchPeople).mockReturnValueOnce(new Promise(done => { resolve = done })).mockResolvedValue(result('Bia'))
  mount(); await userEvent.type(screen.getByLabelText('O que você procura?'), 'primeira'); await userEvent.click(screen.getByRole('button', { name: 'Buscar pessoas' }))
  await userEvent.clear(screen.getByLabelText('O que você procura?')); await userEvent.type(screen.getByLabelText('O que você procura?'), 'segunda'); await userEvent.click(screen.getByRole('button', { name: 'Buscar pessoas' }))
  await screen.findByRole('heading', { name: 'Bia' }); resolve(result('Antiga'))
  await waitFor(() => expect(screen.queryByRole('heading', { name: 'Antiga' })).not.toBeInTheDocument())
})
it('permite repetir busca após falha', async () => {
  vi.mocked(api.searchPeople).mockRejectedValueOnce(new AxiosError('offline')).mockResolvedValue(result())
  mount(); await userEvent.type(screen.getByLabelText('O que você procura?'), 'teste'); await userEvent.click(screen.getByRole('button', { name: 'Buscar pessoas' }))
  await userEvent.click(await screen.findByRole('button', { name: 'Tentar novamente' }))
  expect(await screen.findByRole('heading', { name: 'Ana' })).toBeInTheDocument()
})
it('encaminha sessão expirada ao tratamento compartilhado', async () => {
  const error = new ApiError('Sessão expirada', 401)
  vi.mocked(api.searchPeople).mockRejectedValue(error)
  const report = mount(); await userEvent.type(screen.getByLabelText('O que você procura?'), 'teste'); await userEvent.click(screen.getByRole('button', { name: 'Buscar pessoas' }))
  await waitFor(() => expect(report).toHaveBeenCalledWith(error))
})
it('abre caminho pelo resultado e resolve nomes sem depender da ordem dos nós', async () => {
  mount(); await search(); await userEvent.click(screen.getByRole('link', { name: 'Ver caminho até Ana' }))
  const list = await screen.findByRole('list')
  expect(within(list).getAllByRole('listitem').map(item => item.querySelector('strong')?.textContent)).toEqual(['Ana', 'Bia'])
  expect(screen.getByText('Vínculo: Conexão próxima')).toBeInTheDocument()
  expect(api.getPath).toHaveBeenCalledWith('ana', expect.any(AbortSignal))
})
it('apresenta intermediários e vínculos pelas referências das arestas', async () => {
  vi.mocked(api.getPath).mockResolvedValue({ graph: { nodes: [carla, bia, ana], edges: [{ id: 'second', source: 'carla', target: 'bia', type: 'ic', context: { title: 'Pesquisa X' } }, ...direct.graph.edges] }, path: { user_ids: ['ana', 'bia', 'carla'], steps: [...direct.path!.steps, { order: 2, edge_id: 'second', source: 'bia', target: 'carla' }], cost: { contextual_edges: 1, hops: 2 } } })
  mount('/people/carla/path')
  const list = await screen.findByRole('list')
  expect(within(list).getAllByRole('listitem').map(item => item.querySelector('strong')?.textContent)).toEqual(['Ana', 'Bia', 'Carla'])
  expect(screen.getByText('Vínculo: Orientação de IC · Pesquisa X')).toBeInTheDocument()
})
it('distingue ausência de caminho de pessoa inexistente', async () => {
  vi.mocked(api.getPath).mockResolvedValue({ path: null, graph: direct.graph })
  mount('/people/bia/path')
  expect(await screen.findByText('Não há caminho até esta pessoa.')).toBeInTheDocument()
})
it('informa pessoa inexistente', async () => {
  vi.mocked(api.getPath).mockRejectedValue(new ApiError('Perfil inexistente', 404))
  mount('/people/missing/path')
  expect(await screen.findByRole('alert')).toHaveTextContent('Pessoa inexistente ou inativa.')
})
it('permite repetir consulta de caminho e propaga 401', async () => {
  const error = new ApiError('Sessão expirada', 401)
  vi.mocked(api.getPath).mockRejectedValueOnce(new AxiosError('offline')).mockRejectedValueOnce(error)
  const report = mount('/people/bia/path')
  await userEvent.click(await screen.findByRole('button', { name: 'Tentar novamente' }))
  await waitFor(() => expect(report).toHaveBeenCalledWith(error))
})

it('troca destino sem reaproveitar resposta antiga do caminho', async () => {
  const { Link } = await import('react-router')
  let resolve!: (value: PathResult) => void
  vi.mocked(api.getPath).mockReturnValueOnce(new Promise(done => { resolve = done })).mockResolvedValue({ path: null, graph: { nodes: [carla], edges: [] } })
  const onError = vi.fn()
  render(<MemoryRouter initialEntries={['/people/ana/path']}><Link to="/people/carla/path">Outro destino</Link><Routes><Route path="/people/:personId/path" element={<PathPage onError={onError} />} /></Routes></MemoryRouter>)
  await waitFor(() => expect(api.getPath).toHaveBeenCalledWith('ana', expect.any(AbortSignal)))
  await userEvent.click(screen.getByRole('link', { name: 'Outro destino' }))
  await screen.findByText('Não há caminho até esta pessoa.')
  resolve(direct)
  await waitFor(() => expect(screen.queryByRole('list')).not.toBeInTheDocument())
})
