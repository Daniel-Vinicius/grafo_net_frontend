import { apiClient, apiRequest } from './apiClient'
import type { Option, Profile, ProfileOptions, ProfileUpdate, Project, ProjectInput } from '../types/profile'

// Os contratos são compartilhados pelos formulários e serviços deste módulo.
export async function getOptions(): Promise<ProfileOptions> {
  return await apiRequest<ProfileOptions>('/profiles/options')
}
export async function getProfile(): Promise<Profile> {
  return await apiRequest<Profile>('/profiles/me')
}
export async function getProfileById(id: string): Promise<Profile> {
  return await apiRequest<Profile>(`/profiles/${encodeURIComponent(id)}`)
}
export async function updateProfile(data: ProfileUpdate): Promise<Profile> {
  return await apiRequest<Profile>('/profiles/me', { method: 'PATCH', data })
}
export async function getEntities(): Promise<Option[]> {
  return await apiRequest<Option[]>('/entities')
}
export async function saveProject(data: ProjectInput, id?: string): Promise<Project> {
  return await apiRequest<Project>(`/research-projects${id ? '/' + encodeURIComponent(id) : ''}`, {
    method: id ? 'PATCH' : 'POST',
    data,
  })
}
export async function changeEmail(current_password: string, new_email: string): Promise<void> {
  await apiRequest('/account/email', { method: 'PATCH', data: { current_password, new_email } })
}
export async function changePassword(current_password: string, new_password: string): Promise<void> {
  await apiRequest('/account/password', { method: 'PATCH', data: { current_password, new_password } })
}
export async function deleteAccount(current_password: string): Promise<void> {
  await apiRequest('/account', { method: 'DELETE', data: { current_password } })
}
export async function uploadPhoto(file: File): Promise<void> {
  const form = new FormData()
  form.append('photo', file)
  await apiRequest('/profiles/me/photo', { method: 'PUT', data: form })
}
export async function removePhoto(): Promise<void> {
  await apiRequest('/profiles/me/photo', { method: 'DELETE' })
}
export async function getPhoto(): Promise<Blob> {
  return (await apiClient.get<Blob>('/profiles/me/photo', { responseType: 'blob' })).data
}
