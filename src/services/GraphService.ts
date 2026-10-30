import { apiClient, apiRequest } from './apiClient'
import { buildSearchMock } from '../mocks/searchMock'
import type { Graph, GraphProfile, SearchResult } from '../types/graph'

export async function getGraph(): Promise<Graph> {
  return await apiRequest<Graph>('/graph')
}
export async function getProfilePhoto(id: string): Promise<Blob> {
  return (await apiClient.get<Blob>(`/profiles/${encodeURIComponent(id)}/photo`, { responseType: 'blob' })).data
}
// Demonstração: trocar por POST /search com { query } ao ligar a busca real.
export async function searchProfiles(_query: string, origin: GraphProfile): Promise<SearchResult> {
  return buildSearchMock(origin)
}
