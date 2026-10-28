import { apiClient, apiRequest } from '../../services/apiClient'
import type { Option, Profile, ProfileInput, ProfileOptions, Project, ProjectInput } from './types'

// Os contratos são compartilhados pelos formulários e serviços deste módulo.
export async function getOptions(): Promise<ProfileOptions> {
  return await apiRequest<ProfileOptions>('/auth/profile-options')
}
export async function getProfile(): Promise<Profile> {
  return await apiRequest<Profile>('/auth/profile')
}
export async function updateProfile(data: Partial<ProfileInput & Pick<Profile, 'entity_ids' | 'research_project_ids' | 'experiences_completed'>>): Promise<Profile> {
  return await apiRequest<Profile>('/auth/profile', { method: 'PATCH', data })
}
export async function getEntities(): Promise<Option[]> {
  return await apiRequest<Option[]>('/auth/entities')
}
export async function getProjects(): Promise<Project[]> {
  return await apiRequest<Project[]>('/auth/research-projects')
}
export async function saveProject(data: ProjectInput, id?: string): Promise<Project> {
  return await apiRequest<Project>(`/auth/research-projects${id ? '/' + encodeURIComponent(id) : ''}`, {
    method: id ? 'PATCH' : 'POST',
    data,
  })
}
export async function changeEmail(current_password: string, new_email: string): Promise<void> {
  await apiRequest('/auth/account/email', { method: 'PATCH', data: { current_password, new_email } })
}
export async function changePassword(current_password: string, new_password: string): Promise<void> {
  await apiRequest('/auth/account/password', { method: 'PATCH', data: { current_password, new_password } })
}
export async function deleteAccount(current_password: string): Promise<void> {
  await apiRequest('/auth/account', { method: 'DELETE', data: { current_password } })
}
export async function uploadPhoto(file: File): Promise<void> {
  const form = new FormData()
  form.append('photo', file)
  await apiRequest('/auth/profile/photo', { method: 'PUT', data: form })
}
export async function removePhoto(): Promise<void> {
  await apiRequest('/auth/profile/photo', { method: 'DELETE' })
}
export async function getPhoto(): Promise<Blob> {
  return (await apiClient.get<Blob>('/auth/profile/photo', { responseType: 'blob' })).data
}
