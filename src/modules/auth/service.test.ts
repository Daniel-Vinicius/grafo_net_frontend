import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authenticatedFetch, clearSessionToken, login, register } from '../../services/AuthService'
import { changeEmail, changePassword, deleteAccount, getPhoto, updateProfile, uploadPhoto } from './service'

const fetchMock = vi.fn()
beforeEach(() => { clearSessionToken(); fetchMock.mockReset(); vi.stubGlobal('fetch', fetchMock) })
function ok(body: unknown, status = 200) { return new Response(body === null ? null : JSON.stringify(body), { status }) }
async function signIn() {
  fetchMock.mockResolvedValueOnce(ok({ access_token: 'jwt-test', user: { id: '1', email: 'a@insper.edu.br' } }))
  await login({ email: 'a@insper.edu.br', password: 'password' })
}

describe('serviço autenticado', () => {
  it('envia Bearer e mantém profile no payload de cadastro', async () => {
    const profile = { name: 'Pessoa', course_id: 'law', semester: 1, field_id: 'technology', bio: 'Bio' }
    fetchMock.mockResolvedValueOnce(ok({ id: '1', email: 'a@insper.edu.br' }, 201))
    await register({ email: 'a@insper.edu.br', password: 'password', invite_token: 'invite', profile })
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ email: 'a@insper.edu.br', password: 'password', invite_token: 'invite', profile })
    await signIn()
    fetchMock.mockResolvedValueOnce(ok({ ...profile, id: '1' }))
    await updateProfile({ bio: 'Bio nova' })
    const [, init] = fetchMock.mock.calls[2]
    expect(init.headers.get('Authorization')).toBe('Bearer jwt-test')
    expect(JSON.parse(init.body)).toEqual({ bio: 'Bio nova' })
  })
  it('preserva multipart e autentica o download binário', async () => {
    await signIn()
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))
    const file = new File(['photo'], 'photo.png', { type: 'image/png' })
    await uploadPhoto(file)
    const [, init] = fetchMock.mock.calls[1]
    expect(init.body.get('photo')).toBe(file)
    expect(init.headers.has('Content-Type')).toBe(false)
    expect(init.headers.get('Authorization')).toBe('Bearer jwt-test')
    fetchMock.mockResolvedValueOnce(new Response('photo', { headers: { 'Content-Type': 'image/png' } }))
    expect((await getPhoto()).type).toBe('image/png')
  })
  it('persiste apenas o JWT e envia senha atual nas operações de conta', async () => {
    await signIn()
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))
    await changeEmail('old', 'new@insper.edu.br')
    await changePassword('old', 'newpassword')
    await deleteAccount('old')
    expect(fetchMock.mock.calls.slice(1).map(call => [call[0], call[1].method, JSON.parse(call[1].body)])).toEqual([
      ['/auth/account/email', 'PATCH', { current_password: 'old', new_email: 'new@insper.edu.br' }],
      ['/auth/account/password', 'PATCH', { current_password: 'old', new_password: 'newpassword' }],
      ['/auth/account', 'DELETE', { current_password: 'old' }],
    ])
    expect(localStorage.getItem('grafonet.access_token')).toBe('jwt-test')
    expect(Object.keys(localStorage)).toEqual(['grafonet.access_token'])
    expect(sessionStorage.length).toBe(0)
  })
  it('propaga o status HTTP e mensagem de erro', async () => {
    fetchMock.mockResolvedValueOnce(ok({ message: 'Foto inválida' }, 400))
    await expect(authenticatedFetch('/auth/profile/photo')).rejects.toMatchObject({ status: 400, message: 'Foto inválida' })
  })
})
