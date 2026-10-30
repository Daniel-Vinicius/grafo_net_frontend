import type { Option, Profile, Project } from './profile'

export interface Experience {
  id: string
  title: string
  organization: string
  type: string
  start_date: string
  end_date: string | null
  description: string
}
export interface GraphProfile extends Profile {
  type: '' | 'aluno' | 'alumni' | 'professor'
  course: string
  field: string
  entry_year: number | null
  role: string
  company: string
  photo_url: string | null
  entities: Option[]
  research_projects: Project[]
  experiences: Experience[]
}
export interface GraphEdge {
  id: string
  source: string
  target: string
  type: 'close' | 'class' | 'entity' | 'ic'
  context: { label?: string } & Record<string, unknown>
}
export interface Graph { nodes: GraphProfile[]; edges: GraphEdge[] }
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
  // Não existe na API: marca a resposta de demonstração e carrega os chips dela.
  preview?: { chips: string[] }
}
