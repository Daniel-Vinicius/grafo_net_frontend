import Icon from '../Icon'
import type { GraphEdge, GraphProfile, SearchPath } from '../../types/graph'
import { describeProfile } from '../../utils/profileText'
import ProfileAvatar from './ProfileAvatar'

interface Props {
  person: GraphProfile | null
  relation: string
  path: SearchPath | null
  noPath: boolean
  meId: string
  people: Map<string, GraphProfile>
  edges: Map<string, GraphEdge>
  onClose: () => void
}
export default function PersonPanel({ person, relation, path, noPath, meId, people, edges, onClose }: Props) {
  if (!person) return <aside className="person-panel" aria-live="polite">
    <div className="person-panel-empty">
      <div className="empty-network-icon"><Icon name="network" /></div>
      <h2>Explore sua rede</h2>
      <p>Selecione uma pessoa no grafo para ver perfil, experiências e o contexto da conexão.</p>
    </div>
  </aside>
  const tags = [...person.entities.map(item => item.name), ...person.experiences.map(item => item.title)].slice(0, 5)
  return <aside className="person-panel has-person" aria-live="polite">
    <button className="panel-close" type="button" aria-label="Fechar perfil" onClick={onClose}><Icon name="close" /></button>
    <div className="panel-person-head">
      <ProfileAvatar profile={person} className="large-avatar" />
      <h2>{person.name}</h2>
      <p>{describeProfile(person)}</p>
      {relation && <span className="relation-badge">{relation}</span>}
    </div>
    <div className="panel-section"><h3>Sobre</h3><p className="preserve-lines">{person.bio || 'Esta pessoa ainda não adicionou um resumo ao perfil.'}</p></div>
    {path && <div className="panel-section"><h3>Caminho possível</h3><div className="path-summary">
      {path.user_ids.map((id, index) => {
        const edge = edges.get(path.steps[index]?.edge_id)
        return <span key={id}><i className={edge?.type ?? 'end'} />{id === meId ? 'Você' : people.get(id)?.name}{edge && <small> · {edge.context.label}</small>}</span>
      })}
    </div></div>}
    {noPath && <div className="panel-section"><h3>Caminho possível</h3><p>Sem caminho conhecido até esta pessoa.</p></div>}
    {tags.length > 0 && <div className="panel-section"><h3>Experiências e entidades</h3><div className="tag-row">{tags.map(tag => <span className="tag" key={tag}>{tag}</span>)}</div></div>}
  </aside>
}
