import { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import { apiClient, clearSessionToken } from './apiClient'
import { getConnections, getPath, requestConnection, searchPeople } from './GraphService'
import { getParticipations, reviewParticipation } from './ResearchService'

const adapter = vi.fn()
const originalAdapter = apiClient.defaults.adapter
beforeEach(() => {
  clearSessionToken(); localStorage.setItem('grafonet.access_token', 'jwt')
  adapter.mockReset()
  apiClient.defaults.adapter = adapter
})
afterEach(() => { apiClient.defaults.adapter = originalAdapter; clearSessionToken() })
function ok(data: unknown, status = 200) {
  adapter.mockImplementationOnce(async (config: InternalAxiosRequestConfig) => ({ config, status, statusText: 'OK', headers: {}, data }))
}
it('busca com contrato completo, timeout e Bearer compartilhado', async () => {
  ok({ results: [] })
  const input = { query: 'tecnologia', mode: 'relevance' as const, limit: 10, offset: 20 }
  await searchPeople(input)
  const config = adapter.mock.calls[0][0]
  expect(config.url).toBe('/search'); expect(config.method).toBe('post')
  expect(JSON.parse(config.data)).toEqual(input)
  expect(config.headers.get('Authorization')).toBe('Bearer jwt')
  expect(config.timeout).toBe(30_000)
})
it('desembrulha conexões e solicita somente com destinatário', async () => {
  ok({ connections: [{ id: 'c1' }] }); ok({ id: 'c2' }, 201)
  expect(await getConnections()).toEqual([{ id: 'c1' }])
  expect(await requestConnection('person')).toEqual({ id: 'c2' })
  const config = adapter.mock.calls[1][0]
  expect(config.url).toBe('/connections'); expect(config.method).toBe('post')
  expect(JSON.parse(config.data)).toEqual({ target_user_id: 'person' })
  expect(config.headers.get('Authorization')).toBe('Bearer jwt')
})
it('codifica ID do caminho e preserva cancelamento e timeout', async () => {
  const controller = new AbortController()
  ok({ path: null, graph: { nodes: [], edges: [] } })
  await getPath('a/b', controller.signal)
  const config = adapter.mock.calls[0][0]
  expect(config.url).toBe('/graph/paths/a%2Fb'); expect(config.signal).toBe(controller.signal)
  expect(config.timeout).toBe(10_000)
  expect(config.headers.get('Authorization')).toBe('Bearer jwt')
})
it.each(['pending', 'confirmed', 'rejected'] as const)('consulta orientações %s', async status => {
  ok([])
  expect(await getParticipations(status)).toEqual([])
  const config = adapter.mock.calls[0][0]
  expect(config.url).toBe(`/research-participations?status=${status}`)
  expect(config.headers.get('Authorization')).toBe('Bearer jwt')
})
it.each(['confirmed', 'rejected'] as const)('envia decisão %s e aceita 204', async status => {
  ok('', 204)
  await expect(reviewParticipation('a/b', status)).resolves.toBeUndefined()
  const config = adapter.mock.calls[0][0]
  expect(config.url).toBe('/research-participations/a%2Fb'); expect(config.method).toBe('patch')
  expect(JSON.parse(config.data)).toEqual({ status })
  expect(config.headers.get('Authorization')).toBe('Bearer jwt')
})
it('propaga mensagem e status de conflito da API', async () => {
  adapter.mockImplementationOnce(async (config: InternalAxiosRequestConfig) => {
    throw new AxiosError('Conflict', 'ERR_BAD_REQUEST', config, undefined, { config, data: { message: 'Conexão já existe' }, status: 409, statusText: 'Conflict', headers: {} })
  })
  await expect(requestConnection('ana')).rejects.toMatchObject({ status: 409, message: 'Conexão já existe' })
})
