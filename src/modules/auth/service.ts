import { authenticatedFetch, request } from '../../services/AuthService'
import type { Option, Profile, ProfileInput, ProfileOptions, Project, ProjectInput } from './types'

function json(method: string, data: unknown): RequestInit {
  return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }
}
// Os contratos são compartilhados pelos formulários e serviços deste módulo.
export async function getOptions(): Promise<ProfileOptions> {
  return await request('/api/auth/profile-options') as ProfileOptions
}
export async function getProfile(): Promise<Profile> {
  return await request('/api/auth/profile') as Profile
}
export async function updateProfile(data: Partial<ProfileInput & Pick<Profile, 'entity_ids' | 'research_project_ids' | 'experiences_completed'>>): Promise<Profile> {
  return await request('/api/auth/profile', json('PATCH', data)) as Profile
}
export async function getEntities(): Promise<Option[]> {
  return await request('/api/auth/entities') as Option[]
}
export async function getProjects(): Promise<Project[]> {
  return await request('/api/auth/research-projects') as Project[]
}
export async function saveProject(data: ProjectInput, id?: string): Promise<Project> {
  return await request(`/api/auth/research-projects${id ? '/' + encodeURIComponent(id) : ''}`, json(id ? 'PATCH' : 'POST', data)) as Project
}
export async function changeEmail(current_password: string, new_email: string): Promise<void> {
  await request('/api/auth/account/email', json('PATCH', { current_password, new_email }))
}
export async function changePassword(current_password: string, new_password: string): Promise<void> {
  await request('/api/auth/account/password', json('PATCH', { current_password, new_password }))
}
export async function deleteAccount(current_password: string): Promise<void> {
  await request('/api/auth/account', json('DELETE', { current_password }))
}
export async function uploadPhoto(file: File): Promise<void> {
  const form = new FormData()
  form.append('photo', file)
  await authenticatedFetch('/api/auth/profile/photo', { method: 'PUT', body: form })
}
export async function removePhoto(): Promise<void> {
  await request('/api/auth/profile/photo', { method: 'DELETE' })
}
export async function getPhoto(): Promise<Blob> {
  return (await authenticatedFetch('/api/auth/profile/photo')).blob()
}
