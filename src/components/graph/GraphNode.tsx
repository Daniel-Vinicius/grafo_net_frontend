import type { KeyboardEvent } from 'react'
import useProfilePhoto from '../../hooks/useProfilePhoto'
import type { Profile } from '../../types/profile'
import { avatarColor, type Point } from '../../utils/graphLayout'
import { initials } from '../../utils/profileText'

interface Props { profile: Profile; point: Point; me: boolean; faded: boolean; selected: boolean; onSelect: (id: string) => void }
export default function GraphNode({ profile, point, me, faded, selected, onSelect }: Props) {
  const photo = useProfilePhoto(profile.id, profile.photo_id)
  const radius = me ? 35 : faded ? 23 : 29
  function keyDown(event: KeyboardEvent) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault(); onSelect(profile.id)
  }
  return <g className={`person-node${me ? ' me' : ''}${faded ? ' faded' : ''}${selected ? ' selected' : ''}`} transform={`translate(${point.x} ${point.y})`} role="button" tabIndex={0} aria-label={`Abrir perfil de ${profile.name}`} onClick={() => onSelect(profile.id)} onKeyDown={keyDown}>
    <circle className="node-ring" r={radius + 4} />
    <circle className="node-avatar-bg" r={radius} fill={avatarColor(profile.id)} />
    <text className="node-initials" y="1">{initials(profile.name)}</text>
    {photo && <>
      <clipPath id={`clip-${profile.id}`}><circle r={radius} /></clipPath>
      <image className="node-photo" href={photo} x={-radius} y={-radius} width={radius * 2} height={radius * 2} preserveAspectRatio="xMidYMid slice" clipPath={`url(#clip-${profile.id})`} />
    </>}
    {me && <><rect className="me-pill" x="-17" y={radius - 3} rx="7" width="34" height="14" /><text className="me-text" y={radius + 7}>VOCÊ</text></>}
    <text className="node-name" y={radius + 22}>{profile.name.split(' ')[0]}</text>
  </g>
}
