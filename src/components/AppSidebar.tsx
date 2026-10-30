import type { ComponentProps, ReactNode } from 'react'
import { Link, NavLink, useMatch } from 'react-router'
import AccountMenu from './AccountMenu'
import BrandLogo from './BrandLogo'
import Icon from './Icon'
import type { Profile } from '../types/profile'

const links: { to: string; label: string; icon: ComponentProps<typeof Icon>['name'] }[] = [
  { to: '/', label: 'Minha rede', icon: 'network' },
  { to: '/connections', label: 'Conexões', icon: 'users' },
  { to: '/invitations', label: 'Convites', icon: 'mail' },
  { to: '/profile', label: 'Meu perfil', icon: 'user' },
]
interface Props { profile: Profile; courseName?: string; friendCount: number; people: number | null; busy: boolean; onLogout: () => void; children: ReactNode }
export default function AppSidebar({ profile, courseName, friendCount, people, busy, onLogout, children }: Props) {
  const graphMode = useMatch('/') !== null
  return <div className={`workspace${graphMode ? ' graph-mode' : ''}`}>
    <aside className="sidebar">
      <Link className="sidebar-brand" to="/" aria-label="GrafoNet"><BrandLogo /></Link>
      <nav className="main-nav" aria-label="Navegação principal">
        {links.map(link => <NavLink key={link.to} className="nav-item" to={link.to} end={link.to === '/'} aria-label={link.label}>
          <Icon name={link.icon} /><span>{link.label}</span>{link.to === '/connections' && <strong>{friendCount}</strong>}
        </NavLink>)}
      </nav>
      <div className="sidebar-foot">
        {people !== null && <div className="community-count"><b>{people}</b><span>pessoas na rede</span></div>}
        <AccountMenu className="sidebar-user" profile={profile} busy={busy} onLogout={onLogout}>
          <span><b>{profile.name}</b><small>{[courseName, profile.semester ? `${profile.semester}º semestre` : ''].filter(Boolean).join(' · ')}</small></span>
        </AccountMenu>
      </div>
    </aside>
    <div className="workspace-main">
      <header className="topbar">
        <div className="topbar-context"><span className="status-dot" /><span>Comunidade Insper verificada</span></div>
        <AccountMenu className="avatar-button" profile={profile} busy={busy} onLogout={onLogout} />
      </header>
      {children}
    </div>
  </div>
}
