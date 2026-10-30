import type { ComponentProps, ReactNode } from 'react'
import { Link, NavLink } from 'react-router'
import BrandLogo from './BrandLogo'
import Icon from './Icon'
import ProfileAvatar from './graph/ProfileAvatar'
import type { Profile } from '../types/profile'

const links: { to: string; label: string; icon: ComponentProps<typeof Icon>['name'] }[] = [
  { to: '/', label: 'Minha rede', icon: 'network' },
  { to: '/profile', label: 'Meu perfil', icon: 'user' },
  { to: '/research-projects', label: 'Pesquisas', icon: 'book' },
  { to: '/invitations', label: 'Convites', icon: 'mail' },
  { to: '/account', label: 'Conta', icon: 'settings' },
]
interface Props { profile: Profile; courseName?: string; busy: boolean; onLogout: () => void; children: ReactNode }
export default function AppSidebar({ profile, courseName, busy, onLogout, children }: Props) {
  return <div className="workspace">
    <aside className="sidebar">
      <Link className="sidebar-brand" to="/" aria-label="GrafoNet"><BrandLogo /></Link>
      <nav className="main-nav" aria-label="Navegação principal">
        {links.map(link => <NavLink key={link.to} className="nav-item" to={link.to} end={link.to === '/'} aria-label={link.label}><Icon name={link.icon} /><span>{link.label}</span></NavLink>)}
        <button className="nav-item" type="button" disabled={busy} aria-label="Sair" onClick={onLogout}><Icon name="logout" /><span>{busy ? 'Saindo...' : 'Sair'}</span></button>
      </nav>
      <div className="sidebar-foot">
        <Link className="sidebar-user" to="/profile" aria-label="Abrir meu perfil">
          <ProfileAvatar profile={profile} className="sidebar-avatar" />
          <span><b>{profile.name}</b><small>{[courseName, profile.semester ? `${profile.semester}º semestre` : ''].filter(Boolean).join(' · ')}</small></span>
        </Link>
      </div>
    </aside>
    <div className="workspace-main">
      <header className="topbar">
        <div className="topbar-context"><span className="status-dot" /><span>Comunidade Insper verificada</span></div>
        <Link className="avatar-button" to="/profile" aria-label="Abrir meu perfil"><ProfileAvatar profile={profile} className="sidebar-avatar" /></Link>
      </header>
      {children}
    </div>
  </div>
}
