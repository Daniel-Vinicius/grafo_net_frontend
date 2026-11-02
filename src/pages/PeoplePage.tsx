import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { ApiError } from '../services/AuthService'
import { failureMessage } from '../services/errors'
import { getConnections, requestConnection, searchPeople } from '../services/GraphService'
import type { Connection, SearchInput, SearchMode, SearchResult } from '../types/graph'

export default function PeoplePage({ userId, onError, onChanged }: { userId: string; onError: (error: unknown) => void; onChanged?: () => Promise<void> }) {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<SearchMode>('proximity')
  const [input, setInput] = useState<SearchInput | null>(null)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState<string | null>(null)
  const lock = useRef(false)
  const mounted = useRef(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [retry, setRetry] = useState(0)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  useEffect(() => {
    if (!input) return
    const controller = new AbortController()
    let active = true
    Promise.all([searchPeople(input, controller.signal), getConnections(controller.signal)]).then(([next, items]) => {
      if (active) { setResult(next); setConnections(items) }
    }).catch(cause => {
      if (active) { setError(failureMessage(cause)); if (cause instanceof ApiError && cause.status === 401) onError(cause) }
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false; controller.abort() }
  }, [input, retry, onError])
  function submit(event: FormEvent) {
    event.preventDefault()
    if (!query.trim()) return
    setLoading(true); setError(''); setResult(null); setNotice(''); setInput({ query: query.trim(), mode, limit: 10, offset: 0 })
  }
  async function connect(id: string) {
    if (lock.current) return
    lock.current = true; setPending(id); setError(''); setNotice('')
    try {
      const connection = await requestConnection(id)
      if (mounted.current) { setConnections(items => [...items.filter(item => item.id !== connection.id), connection]); setNotice('Solicitação de conexão enviada.'); void onChanged?.().catch(onError) }
    } catch (cause) {
      if (!mounted.current) return
      setError(failureMessage(cause))
      if (cause instanceof ApiError && cause.status === 401) onError(cause)
      if (cause instanceof ApiError && cause.status === 409) {
        // Invalida os controles até reconciliar um vínculo criado em outra sessão.
        setLoading(true); setError(''); setResult(null); setRetry(value => value + 1); setNotice(cause.message); void onChanged?.().catch(onError)
      }
    } finally { lock.current = false; if (mounted.current) setPending(null) }
  }
  return <section className="content-card"><h1>Pessoas</h1>
    <p>Busque pessoas por afinidade com sua consulta.</p>
    <form className="auth-form" onSubmit={submit}>
      <div className="form-field"><label htmlFor="people-query">O que você procura?</label><input id="people-query" value={query} onChange={event => setQuery(event.target.value)} required maxLength={4000} /></div>
      <div className="form-field"><label htmlFor="people-mode">Ordenar por</label><select id="people-mode" value={mode} onChange={event => setMode(event.target.value as SearchMode)}><option value="proximity">Proximidade</option><option value="relevance">Relevância</option></select></div>
      <button className="submit-button" disabled={!query.trim() || pending !== null}>Buscar pessoas</button>
    </form>
    {loading && <p role="status">Buscando pessoas...</p>}
    {error && <p role="alert" className="form-error">{error}<button type="button" onClick={() => { setLoading(true); setError(''); setResult(null); setRetry(value => value + 1) }}>Tentar novamente</button></p>}
    {notice && <p role="status">{notice}</p>}
    {result && <div aria-label="Resultados da busca">
      {result.indexing_pending > 0 && <p>Alguns perfis aguardam indexação e ainda não aparecem na busca.</p>}
      {!result.results.length && <p>Nenhuma pessoa encontrada.</p>}
      {result.results.map(item => {
        const person = result.graph.nodes.find(node => node.id === item.profile_id)
        const connection = connections.find(value => [value.user_a_id, value.user_b_id].includes(item.profile_id))
        const label = connection?.status === 'accepted' ? 'Conexão confirmada' : connection ? (connection.requested_by === userId ? 'Solicitação enviada' : 'Solicitação recebida') : 'Solicitar conexão'
        return <article className="project-card" key={item.profile_id}>
          <h2>{person?.name ?? item.profile_id}</h2><p>{person?.course}</p><p className="preserve-lines">{person?.bio}</p>
          <div className="actions"><button className="secondary-button" disabled={!!connection || pending !== null || item.profile_id === userId} onClick={() => void connect(item.profile_id)}>{pending === item.profile_id ? 'Enviando...' : label}</button>
            <Link to={`/people/${encodeURIComponent(item.profile_id)}/path`}>Ver caminho até {person?.name ?? 'esta pessoa'}</Link></div>
        </article>
      })}
      <div className="actions" aria-label="Paginação"><button disabled={result.offset === 0 || pending !== null} onClick={() => { setLoading(true); setError(''); setResult(null); setInput({ ...input!, offset: Math.max(0, result.offset - result.limit) }) }}>Anterior</button>
        <span>{result.total} pessoa(s) encontrada(s)</span><button disabled={result.offset + result.limit >= result.total || pending !== null} onClick={() => { setLoading(true); setError(''); setResult(null); setInput({ ...input!, offset: result.offset + result.limit }) }}>Próxima</button></div>
    </div>}
  </section>
}
