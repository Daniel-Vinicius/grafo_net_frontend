import Icon from '../Icon'
import type { SearchHit, SearchResult } from '../../types/graph'
import type { Profile } from '../../types/profile'
import { describeProfile, plural } from '../../utils/profileText'
import ProfileAvatar from './ProfileAvatar'

function hitBadge(hit: SearchHit): string {
  if (!hit.cost) return 'sem caminho'
  return hit.cost.contextual_edges ? `${hit.cost.contextual_edges} contextual` : 'só próximas'
}
interface Props { search: SearchResult; people: Map<string, Profile>; activeId: string | null; onPick: (id: string) => void; onClose: () => void }
export default function ResultsPanel({ search, people, activeId, onPick, onClose }: Props) {
  return <div className="results-panel">
    <div className="results-head">
      <div><span>{plural(search.results.length, 'resultado', 'resultados')}</span>{search.indexing_pending > 0 && <small>{plural(search.indexing_pending, 'perfil ainda sendo indexado', 'perfis ainda sendo indexados')}</small>}</div>
      <button type="button" aria-label="Fechar resultados" onClick={onClose}><Icon name="close" /></button>
    </div>
    <div className="result-list">
      {search.results.map(hit => {
        const person = people.get(hit.profile_id)
        if (!person) return null
        return <button key={hit.profile_id} className={`result-card${hit.profile_id === activeId ? ' is-active' : ''}`} type="button" aria-pressed={hit.profile_id === activeId} onClick={() => onPick(hit.profile_id)}>
          <ProfileAvatar profile={person} className="mini-avatar" />
          <span><b>{person.name}</b><small>{describeProfile(person)}</small></span>
          <em>{hitBadge(hit)}</em>
        </button>
      })}
      {!search.results.length && <div className="result-empty">Nenhum perfil combina com essa busca.<br />Tente usar curso, experiência, empresa ou interesse.</div>}
    </div>
  </div>
}
