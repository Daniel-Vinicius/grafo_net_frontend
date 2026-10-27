import { useEffect, useState, type ChangeEvent } from 'react'
import { getPhoto, removePhoto, uploadPhoto } from '../service'

interface Props { photoId: string | null; onChanged: () => Promise<void>; onError: (error: unknown) => void }
export default function PhotoPanel({ photoId, onChanged, onError }: Props) {
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
  return <section className="photo-panel" aria-busy={busy} aria-label="Foto do perfil">
    {url ? <img className="profile-photo" src={url} alt="Sua foto de perfil" /> : <div className="photo-placeholder">Sem foto</div>}
    <div className="form-field"><label htmlFor="profile-photo">Adicionar ou trocar foto</label>
      <input id="profile-photo" type="file" accept="image/jpeg,image/png" disabled={busy} onChange={select} />
      <small>JPEG ou PNG, até 2 MiB e 16 milhões de pixels.</small></div>
    {photoId && <button type="button" className="secondary-button" disabled={busy} onClick={remove}>Remover foto</button>}
    {busy && <p role="status">Atualizando foto...</p>}
  </section>
}
