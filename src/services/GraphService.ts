import { apiClient, apiRequest } from './apiClient'
import type { Connection, Graph, SearchResult, SearchInput, PathResult } from '../types/graph'

export async function getGraph(): Promise<Graph> {
  return await apiRequest<Graph>('/graph')
}
export async function getProfilePhoto(id: string): Promise<Blob> {
  return (await apiClient.get<Blob>(`/profiles/${encodeURIComponent(id)}/photo`, { responseType: 'blob' })).data
}
export async function getNetworkStats(): Promise<{ people: number }> {
  return await apiRequest<{ people: number }>('/graph/stats')
}
// A busca gera o embedding da consulta, que pode levar até GEMINI_TIMEOUT (15s).
export async function searchProfiles(query: string): Promise<SearchResult> {
  return await apiRequest<SearchResult>('/search', { method: 'POST', data: { query, mode: 'relevance' }, timeout: 30_000 })
}
export async function getConnections(signal?: AbortSignal): Promise<Connection[]> {
  return (await apiRequest<{ connections: Connection[] }>('/connections', { signal })).connections
}
export async function acceptConnection(id: string): Promise<void> {
  await apiRequest(`/connections/${encodeURIComponent(id)}/accept`, { method: 'POST' })
}
export async function removeConnection(id: string): Promise<void> {
  await apiRequest(`/connections/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function searchPeople(input: SearchInput, signal?: AbortSignal): Promise<SearchResult> {
  return await apiRequest<SearchResult>('/search', { method: 'POST', data: input, signal, timeout: 30_000 })
}
export async function requestConnection(target_user_id: string): Promise<Connection> {
  return await apiRequest<Connection>('/connections', { method: 'POST', data: { target_user_id } })
}
export async function getPath(id: string, signal?: AbortSignal): Promise<PathResult> {
  return await apiRequest<PathResult>(`/graph/paths/${encodeURIComponent(id)}`, { signal })
}
