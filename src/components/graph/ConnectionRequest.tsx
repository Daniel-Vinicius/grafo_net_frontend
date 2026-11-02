import { useEffect, useRef, useState } from 'react'
import { ApiError, getErrorMessage } from '../../services/apiClient'
import { requestConnection } from '../../services/GraphService'
import type { Connection } from '../../types/graph'

interface Props {
  personId: string
  meId: string
  connections: Connection[]
  onChanged: () => Promise<void>
  onError: (error: unknown) => void
}
export default function ConnectionRequest({ personId, meId, connections, onChanged, onError }: Props) {
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const lock = useRef(false)
  const mounted = useRef(false)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const connection = connections.find(item => item.user_a_id === personId || item.user_b_id === personId)
  const label = connection?.status === 'accepted' ? 'Conexão confirmada' : connection ? (connection.requested_by === meId ? 'Solicitação enviada' : 'Solicitação recebida') : sent ? 'Solicitação enviada' : 'Solicitar conexão'
  async function submit() {
    if (lock.current) return
    lock.current = true; setBusy(true); setError('')
    try {
      await requestConnection(personId)
      if (mounted.current) { setSent(true); void onChanged().catch(onError) }
    } catch (cause) {
      if (!mounted.current) return
      setError(getErrorMessage(cause))
      if (cause instanceof ApiError && cause.status === 401) onError(cause)
      if (cause instanceof ApiError && cause.status === 409) {
        setSent(true); void onChanged().catch(onError)
      }
    } finally { lock.current = false; if (mounted.current) setBusy(false) }
  }
  return <div><button className="secondary-button" type="button" disabled={busy || sent || !!connection} onClick={() => void submit()}>{busy ? 'Enviando...' : label}</button>
    {error && <p role="alert" className="form-error">{error}</p>}
  </div>
}
