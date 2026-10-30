import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../components/Icon'
import NetworkGraph, { type GraphScene } from '../components/graph/NetworkGraph'
import PersonPanel from '../components/graph/PersonPanel'
import RelationshipModal from '../components/graph/RelationshipModal'
import ResultsPanel from '../components/graph/ResultsPanel'
import SmartSearch from '../components/graph/SmartSearch'
import { getGraph, searchProfiles } from '../services/GraphService'
import type { Graph, GraphEdge, GraphProfile, SearchPath, SearchResult } from '../types/graph'
import { pathLayout, ringLayout } from '../utils/graphLayout'
import { describePath, plural } from '../utils/profileText'

function networkScene(graph: Graph, meId: string): GraphScene {
  const friends = graph.edges.map(edge => edge.source === meId ? edge.target : edge.source)
  return {
    nodes: graph.nodes,
    links: graph.edges.map(edge => ({ edge, from: edge.source, to: edge.target, path: false })),
    positions: ringLayout(meId, friends),
  }
}
function pathScene(path: SearchPath, people: Map<string, GraphProfile>, edges: Map<string, GraphEdge>): GraphScene {
  return {
    nodes: path.user_ids.flatMap(id => people.get(id) ?? []),
    // A aresta tem ordem canônica; quem indica o sentido percorrido é o passo.
    links: path.steps.flatMap(step => {
      const edge = edges.get(step.edge_id)
      return edge ? [{ edge, from: step.source, to: step.target, path: true }] : []
    }),
    positions: pathLayout(path.user_ids),
  }
}
interface Props { profileId: string; onError: (error: unknown) => void }
export default function GraphPage({ profileId, onError }: Props) {
  const [graph, setGraph] = useState<Graph | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [search, setSearch] = useState<SearchResult | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [notice, setNotice] = useState('')
  const [guide, setGuide] = useState(false)
  const searchRun = useRef(0)
  useEffect(() => {
    let active = true
    getGraph().then(next => { if (active) setGraph(next) }).catch(error => {
      if (active) { setFailed(true); onError(error) }
    })
    return () => { active = false }
  }, [attempt, onError])
  const people = useMemo(() => new Map([...(search?.graph.nodes ?? []), ...(graph?.nodes ?? [])].map(node => [node.id, node])), [graph, search])
  const edges = useMemo(() => new Map((search?.graph.edges ?? []).map(edge => [edge.id, edge])), [search])
  const activeHit = search?.results.find(hit => hit.profile_id === activeId) ?? null
  const path = activeHit?.path ?? null
  const scene = useMemo(() => {
    if (path) return pathScene(path, people, edges)
    return graph ? networkScene(graph, profileId) : null
  }, [path, people, edges, graph, profileId])
  const closeGuide = useCallback(() => setGuide(false), [])

  function clearSearch() { searchRun.current += 1; setSearching(false); setSearch(null); setActiveId(null); setSelectedId(null) }
  function pick(id: string) { setActiveId(id); setSelectedId(id) }
  async function runSearch(query: string) {
    const origin = people.get(profileId)
    if (!origin) return
    if (!query.trim()) { setNotice('Descreva quem você quer encontrar.'); return }
    const run = ++searchRun.current
    setNotice(''); setSearching(true)
    try {
      const next = await searchProfiles(query.trim(), origin)
      if (run !== searchRun.current) return
      const first = next.results[0]?.profile_id ?? null
      setSearch(next); setActiveId(first); setSelectedId(first)
    } catch (error) {
      if (run === searchRun.current) onError(error)
    } finally {
      if (run === searchRun.current) setSearching(false)
    }
  }
  if (!graph) return <section className="content-card">
    {failed ? <button className="secondary-button" onClick={() => { setFailed(false); setAttempt(value => value + 1) }}>Tentar novamente</button> : <p role="status">Carregando sua rede...</p>}
  </section>

  const friendCount = graph.edges.length
  const isFriend = (id: string) => graph.edges.some(edge => edge.source === id || edge.target === id)
  const selected = selectedId ? people.get(selectedId) ?? null : null
  const selectedHit = search?.results.find(hit => hit.profile_id === selectedId) ?? null
  const relation = !selected ? '' : selected.id === profileId ? 'Você' : selectedHit?.cost ? describePath(selectedHit.cost, ['contextual', 'contextuais']) : isFriend(selected.id) ? 'Conexão Próxima' : ''
  const target = path ? people.get(activeId!) : null
  return <div className="graph-view">
    <div className="page-heading">
      <div>
        <p className="eyebrow">Sua rede de confiança</p>
        <h1>Encontre o caminho, não só a pessoa.</h1>
        <p>Comece pelas suas conexões próximas ou descreva quem você procura.</p>
      </div>
      <div className="network-stats" aria-label="Resumo da rede"><span><b>{friendCount}</b> {friendCount === 1 ? 'conexão próxima' : 'conexões próximas'}</span></div>
    </div>
    <SmartSearch busy={searching} onSearch={query => void runSearch(query)} />
    {notice && <p className="search-notice" role="status">{notice}</p>}
    <button className="info-button" type="button" onClick={() => setGuide(true)}><Icon name="info" /><span>Como os vínculos funcionam</span></button>
    <div className="network-workspace">
      <section className="graph-surface" aria-labelledby="graph-title">
        <div className="graph-toolbar">
          <div>
            <strong id="graph-title">{target ? `Caminho até ${target.name}` : 'Suas conexões próximas'}</strong>
            <span>{path ? describePath(path.cost, ['vínculo contextual', 'vínculos contextuais']) : friendCount ? `${plural(friendCount, 'relação recíproca', 'relações recíprocas')} · clique em alguém para abrir o perfil` : 'Você ainda não tem conexões próximas'}</span>
          </div>
          <div className="graph-toolbar-actions">
            <span className="legend-item"><i className="legend-line" />conexão próxima</span>
            {path && <span className="legend-item path-legend"><i className="legend-line" />caminho encontrado</span>}
            {search && <button className="quiet-button" type="button" onClick={clearSearch}>Voltar à minha rede</button>}
          </div>
        </div>
        <div className="graph-stage">
          {search && <ResultsPanel search={search} people={people} activeId={activeId} onPick={pick} onClose={clearSearch} />}
          {scene && <NetworkGraph key={path ? activeId : 'network'} scene={scene} meId={profileId} selectedId={selectedId} onSelect={setSelectedId} />}
          {!path && !friendCount && <p className="graph-empty">Quando alguém aceitar seu convite, a conexão aparece aqui.</p>}
          <div className="graph-hint"><span>Arraste para explorar</span><span>•</span><span>Selecione um perfil</span></div>
        </div>
      </section>
      <PersonPanel person={selected} relation={relation} path={selectedHit?.path ?? null} noPath={!!selectedHit && !selectedHit.path} meId={profileId} people={people} edges={edges} onClose={() => setSelectedId(null)} />
    </div>
    {guide && <RelationshipModal onClose={closeGuide} />}
  </div>
}
