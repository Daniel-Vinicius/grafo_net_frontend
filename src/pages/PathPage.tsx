import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ApiError } from '../services/AuthService'
import { getPath } from '../services/GraphService'
import type { PathResult } from '../types/graph'
import { failureMessage } from '../services/errors'

const edgeLabels = { close: 'Conexão próxima', class: 'Mesma turma', entity: 'Mesma entidade', ic: 'Orientação de IC' }
export default function PathPage({ onError }: { onError: (error: unknown) => void }) {
  const { personId = '' } = useParams()
  const [response, setResponse] = useState<{ personId: string; version: number; data: PathResult | null; error: string } | null>(null)
  const [retry, setRetry] = useState(0)
  const current = response?.personId === personId && response.version === retry ? response : null
  const data = current?.data
  const error = current?.error
  useEffect(() => {
    let active = true
    const controller = new AbortController()
    getPath(personId, controller.signal).then(next => { if (active) setResponse({ personId, version: retry, data: next, error: '' }) }).catch(cause => {
      if (!active) return
      setResponse({ personId, version: retry, data: null, error: cause instanceof ApiError && cause.status === 404 ? 'Pessoa inexistente ou inativa.' : failureMessage(cause) })
      if (cause instanceof ApiError && cause.status === 401) onError(cause)
    })
    return () => { active = false; controller.abort() }
  }, [personId, retry, onError])
  return <section className="content-card"><h1>Caminho até uma pessoa</h1><Link to="/people">Voltar à busca de pessoas</Link>
    {error ? <p className="form-error" role="alert">{error}<button onClick={() => setRetry(value => value + 1)}>Tentar novamente</button></p> : !data ? <p role="status">Consultando caminho...</p> : !data.path ? <p>Não há caminho até esta pessoa.</p> : <>
      <p>{data.path.cost.hops} salto(s) · {data.path.cost.contextual_edges} vínculo(s) de contexto</p>
      <ol className="network-path">{data.path.user_ids.map((id, index) => {
        const person = data.graph.nodes.find(node => node.id === id)
        const step = data.path!.steps.find(item => item.order === index + 1)
        const edge = data.graph.edges.find(item => item.id === step?.edge_id)
        return <li key={id}><strong>{person?.name ?? id}</strong>{person?.course && <p>{person.course}</p>}
          {edge && <p>Vínculo: {edgeLabels[edge.type]}{typeof edge.context.title === 'string' ? ` · ${edge.context.title}` : typeof edge.context.name === 'string' ? ` · ${edge.context.name}` : ''}</p>}</li>
      })}</ol>
    </>}
  </section>
}
