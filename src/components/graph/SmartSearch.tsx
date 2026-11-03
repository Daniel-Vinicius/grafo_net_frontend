import { useState, type FormEvent } from 'react'
import Icon from '../Icon'

const suggestions = [
  { label: 'CC + mercado financeiro', query: 'Ciência da Computação com experiência no mercado financeiro' },
  { label: 'Direito + IA', query: 'Estudante de Direito interessado em regulação de IA' },
  { label: 'Economia + impacto social', query: 'Pessoa de Economia da Enactus interessada em impacto social' },
  { label: 'CC + IC em IA', query: 'Alumni de CC que fez IC em explicabilidade de IA' },
]
interface Props {
  busy: boolean
  onSearch: (query: string, limit: number) => void
}
export default function SmartSearch({ busy, onSearch }: Props) {
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState(10)
  function submit(event: FormEvent) { event.preventDefault(); onSearch(query, limit) }
  return <>
    <form className="smart-search" role="search" onSubmit={submit}>
      <span className="ai-spark" aria-hidden="true">✦</span>
      <label className="sr-only" htmlFor="graph-search">Descreva quem você procura</label>
      <input id="graph-search" type="search" autoComplete="off" maxLength={4000} placeholder="Ex.: alguém de CC que já estagiou no mercado financeiro" value={query} onChange={event => setQuery(event.target.value)} />
      <div className="search-actions">
  <button type="submit" disabled={busy}>
    <Icon name="search" />
    <span>Buscar</span>
  </button>

  <details className="search-settings">
    <summary>
      Até {limit} pessoas <span aria-hidden="true">▾</span>
    </summary>

    <div className="search-settings-panel">
          <label htmlFor="search-result-limit">
            Amplitude da busca
            <strong>{limit}</strong>
          </label>

          <input
            id="search-result-limit"
            type="range"
            min={3}
            max={50}
            step={1}
            value={limit}
            disabled={busy}
            onChange={event => setLimit(Number(event.target.value))}
          />

          <div className="search-settings-scale">
            <span>Menos resultados</span>
            <span>Mais resultados</span>
          </div>

          <p>Até {limit} pessoas, ordenadas por relevância.</p>
        </div>
      </details>
    </div>
    </form>
    <div className="search-suggestions" aria-label="Exemplos de busca">
      <span>Experimente:</span>
      {suggestions.map(item => <button key={item.label} type="button" disabled={busy} onClick={() => { setQuery(item.query); onSearch(item.query, limit) }}>{item.label}</button>)}
    </div>
  </>
}
