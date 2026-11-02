import { apiRequest } from './apiClient'
import type { ParticipationStatus, ReceivedParticipation, Project } from '../types/profile'

export async function getProjects(signal?: AbortSignal): Promise<Project[]> {
  return await apiRequest<Project[]>('/research-projects', { signal })
}
export async function getParticipations(status: ParticipationStatus, signal?: AbortSignal): Promise<ReceivedParticipation[]> {
  return await apiRequest<ReceivedParticipation[]>(`/research-participations?status=${status}`, { signal })
}
export async function reviewParticipation(id: string, status: 'confirmed' | 'rejected'): Promise<void> {
  await apiRequest(`/research-participations/${encodeURIComponent(id)}`, { method: 'PATCH', data: { status } })
}
