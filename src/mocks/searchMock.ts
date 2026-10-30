import type { GraphEdge, GraphProfile, PathCost, SearchHit, SearchResult } from '../types/graph'

// Resposta de demonstração no formato de POST /search, usada até a busca real ser ligada.
const empty: Omit<GraphProfile, 'id' | 'name' | 'course' | 'type'> = {
  course_id: '', semester: 1, field_id: '', field: '', bio: '', entity_ids: [], research_project_ids: [],
  experiences_completed: true, entry_year: null, role: '', company: '', photo_id: null, photo_url: null,
  entities: [], research_projects: [], experiences: [],
}
const experience = (id: string, title: string, organization: string) => ({
  id, title, organization, type: 'Estágio', start_date: '2025-01-01', end_date: null, description: '',
})
const people: GraphProfile[] = [
  { ...empty, id: 'mock-rafael', name: 'Rafael Prado', type: 'aluno', course: 'Ciência da Computação', semester: 5 },
  { ...empty, id: 'mock-julia', name: 'Júlia Castro', type: 'aluno', course: 'Economia', semester: 6, entities: [{ id: 'mock-enactus', name: 'Enactus' }] },
  { ...empty, id: 'mock-marina', name: 'Marina Lopes', type: 'aluno', course: 'Ciência da Computação', semester: 6, bio: 'Estuda modelos de crédito e estagia em uma fintech.', experiences: [experience('mock-exp-1', 'Estágio em dados', 'Fintech Exemplo')] },
  { ...empty, id: 'mock-thiago', name: 'Thiago Mendes', type: 'alumni', course: 'Ciência da Computação', entry_year: 2018, role: 'Analista de risco', company: 'Banco Exemplo', bio: 'Trabalha com prevenção a fraudes.', entities: [{ id: 'mock-enactus', name: 'Enactus' }] },
  { ...empty, id: 'mock-beatriz', name: 'Beatriz Ramos', type: 'professor', course: 'Ciência da Computação', role: 'Professora', bio: 'Orienta iniciações científicas em IA explicável.' },
  { ...empty, id: 'mock-caio', name: 'Caio Nunes', type: 'aluno', course: 'Direito', semester: 3, bio: 'Interessado em regulação de tecnologia.' },
]
const edge = (id: string, source: string, target: string, type: GraphEdge['type'], label: string): GraphEdge => ({
  id, source, target, type, context: { label },
})
function hit(profile_id: string, similarity: number, user_ids: string[] | null, edgeIds: string[], cost: PathCost | null): SearchHit {
  if (!user_ids) return { profile_id, similarity, cost: null, path: null }
  const steps = edgeIds.map((edge_id, order) => ({ edge_id, order, source: user_ids[order], target: user_ids[order + 1] }))
  return { profile_id, similarity, cost, path: { user_ids, steps, cost: cost! } }
}
export function buildSearchMock(origin: GraphProfile): SearchResult {
  const me = origin.id
  const edges = [
    edge('mock-e1', me, 'mock-rafael', 'close', 'Conexão próxima confirmada'),
    edge('mock-e2', 'mock-rafael', 'mock-marina', 'close', 'Conexão próxima confirmada'),
    edge('mock-e3', 'mock-rafael', 'mock-julia', 'close', 'Conexão próxima confirmada'),
    edge('mock-e4', 'mock-julia', 'mock-thiago', 'entity', 'Enactus'),
    edge('mock-e5', me, 'mock-julia', 'class', 'Mesma turma'),
    edge('mock-e6', 'mock-julia', 'mock-beatriz', 'ic', 'IC em IA explicável'),
  ]
  const results = [
    hit('mock-marina', 0.82, [me, 'mock-rafael', 'mock-marina'], ['mock-e1', 'mock-e2'], { contextual_edges: 0, hops: 2 }),
    hit('mock-thiago', 0.78, [me, 'mock-rafael', 'mock-julia', 'mock-thiago'], ['mock-e1', 'mock-e3', 'mock-e4'], { contextual_edges: 1, hops: 3 }),
    hit('mock-beatriz', 0.71, [me, 'mock-julia', 'mock-beatriz'], ['mock-e5', 'mock-e6'], { contextual_edges: 2, hops: 2 }),
    hit('mock-caio', 0.64, null, [], null),
  ]
  return {
    results, total: results.length, mode: 'proximity', limit: 10, offset: 0, indexing_pending: 0,
    graph: { nodes: [origin, ...people], edges },
    preview: { chips: ['Ciência da Computação', 'Mercado financeiro'] },
  }
}
