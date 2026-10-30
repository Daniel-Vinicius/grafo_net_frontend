import useProfilePhoto from '../../hooks/useProfilePhoto'
import type { Profile } from '../../types/profile'
import { avatarColor } from '../../utils/graphLayout'
import { initials } from '../../utils/profileText'

interface Props { profile: Pick<Profile, 'id' | 'name' | 'photo_id'>; className: string }
export default function ProfileAvatar({ profile, className }: Props) {
  const photo = useProfilePhoto(profile.id, profile.photo_id)
  if (photo) return <img className={className} src={photo} alt={`Foto de ${profile.name}`} />
  return <span className={className} style={{ background: avatarColor(profile.id) }} role="img" aria-label={profile.name}>{initials(profile.name)}</span>
}
