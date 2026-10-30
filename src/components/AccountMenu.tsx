import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import ProfileAvatar from './graph/ProfileAvatar'
import type { Profile } from '../types/profile'

interface Props { profile: Profile; busy: boolean; onLogout: () => void; className: string; children?: ReactNode }
export default function AccountMenu({ profile, busy, onLogout, className, children }: Props) {
  const [open, setOpen] = useState(false)
  const menu = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    function pointerDown(event: PointerEvent) { if (!menu.current?.contains(event.target as Node)) setOpen(false) }
    function keyDown(event: KeyboardEvent) { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', pointerDown)
    document.addEventListener('keydown', keyDown)
    return () => { document.removeEventListener('pointerdown', pointerDown); document.removeEventListener('keydown', keyDown) }
  }, [open])
  return <div className="account-menu" ref={menu}>
    <button className={className} type="button" aria-haspopup="menu" aria-expanded={open} aria-label="Abrir menu da conta" onClick={() => setOpen(value => !value)}>
      <ProfileAvatar profile={profile} className="sidebar-avatar" />{children}
    </button>
    {open && <div className="account-dropdown" role="menu">
      <Link role="menuitem" to="/profile" onClick={() => setOpen(false)}>Meu perfil</Link>
      <Link role="menuitem" to="/account" onClick={() => setOpen(false)}>Conta</Link>
      <button role="menuitem" type="button" disabled={busy} onClick={onLogout}>{busy ? 'Saindo...' : 'Sair'}</button>
    </div>}
  </div>
}
