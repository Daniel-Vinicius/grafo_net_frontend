import { useEffect, useState, type ChangeEvent } from 'react'
import Icon from './Icon'
import { getPhoto, removePhoto, uploadPhoto } from '../services/ProfileService'
import { avatarColor } from '../utils/graphLayout'
import { initials } from '../utils/profileText'

interface Props { profileId: string; name: string; photoId: string | null; onChanged: () => Promise<void>; onError: (error: unknown) => void }
export default function PhotoPanel({ profileId, name, photoId, onChanged, onError }: Props) {
  const [photo, setPhoto] = useState<{ id: string; url: string } | null>(null)
  const url = photo?.id === photoId ? photo.url : null
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    let active = true
    let objectUrl: string | null = null
    if (photoId) {
      getPhoto().then(blob => {
        if (!active) return
        objectUrl = URL.createObjectURL(blob)
        setPhoto({ id: photoId!, url: objectUrl })
      }).catch(error => { if (active) onError(error) })
    }
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [photoId, onError])
  async function select(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      onError(new Error('Escolha uma foto JPEG ou PNG de até 2 MiB.')); return
    }
    setBusy(true)
    try { await uploadPhoto(file); await onChanged() } catch (error) { onError(error) } finally { setBusy(false) }
  }
  async function remove() {
    setBusy(true)
    try { await removePhoto(); await onChanged() } catch (error) { onError(error) } finally { setBusy(false) }
  }
  return <div className="photo-picker" aria-busy={busy}>
    <label className="photo-button">
      <input className="sr-only" type="file" accept="image/jpeg,image/png" aria-label="Trocar foto do perfil" disabled={busy} onChange={select} />
      {url ? <img className="large-avatar" src={url} alt="Sua foto de perfil" /> : <span className="large-avatar" style={{ background: avatarColor(profileId) }}>{initials(name)}</span>}
      <span className="photo-hint">{busy ? 'Enviando...' : photoId ? 'Trocar foto' : 'Adicionar foto'}</span>
    </label>
    {photoId && <button type="button" className="photo-remove" disabled={busy} aria-label="Remover foto" onClick={() => void remove()}><Icon name="close" /></button>}
  </div>
}
