import { useEffect, useRef, type ReactNode } from 'react'
import Icon from './Icon'

interface Props { labelledBy: string; onClose: () => void; children: ReactNode }
export default function Modal({ labelledBy, onClose, children }: Props) {
  const close = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    close.current?.focus()
    function keyDown(event: KeyboardEvent) { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', keyDown)
    return () => document.removeEventListener('keydown', keyDown)
  }, [onClose])
  return <div className="modal-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
      <button ref={close} className="modal-close" type="button" aria-label="Fechar" onClick={onClose}><Icon name="close" /></button>
      {children}
    </section>
  </div>
}
