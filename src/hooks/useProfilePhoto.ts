import { useEffect, useState } from 'react'
import { getProfilePhoto } from '../services/GraphService'

// A rota exige o token, então a foto vem como blob. Sem ela, quem chama mostra as iniciais.
export default function useProfilePhoto(id: string, photoId: string | null): string | null {
  const [photo, setPhoto] = useState<{ id: string; url: string } | null>(null)
  useEffect(() => {
    let active = true
    let objectUrl: string | null = null
    if (photoId) {
      getProfilePhoto(id).then(blob => {
        if (!active) return
        objectUrl = URL.createObjectURL(blob)
        setPhoto({ id: photoId, url: objectUrl })
      }).catch(() => undefined)
    }
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [id, photoId])
  return photo?.id === photoId ? photo.url : null
}
