import type { Profile } from './profile'

export interface GraphEdge {
  id: string
  source: string
  target: string
  type: 'close' | 'class' | 'entity' | 'ic'
  context: { label?: string } & Record<string, unknown>
}
export interface Graph { nodes: Profile[]; edges: GraphEdge[] }
export interface PathCost { contextual_edges: number; hops: number }
export interface PathStep { edge_id: string; order: number; source: string; target: string }
export interface SearchPath { user_ids: string[]; steps: PathStep[]; cost: PathCost }
export interface SearchHit {
  profile_id: string
  similarity: number
  cost: PathCost | null
  path: SearchPath | null
}
export interface SearchResult {
  results: SearchHit[]
  total: number
  mode: string
  limit: number
  offset: number
  indexing_pending: number
  graph: Graph
}
export interface Connection {
  id: string
  user_a_id: string
  user_b_id: string
  requested_by: string
  status: 'pending' | 'accepted'
  created_at: string
  accepted_at: string | null
}
