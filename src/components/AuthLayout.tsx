import type { ReactNode } from 'react'
import AuthGraph from './AuthGraph'
import BrandLogo from './BrandLogo'

interface Props { eyebrow: string; title: string; description?: string; children: ReactNode }

export default function AuthLayout({ eyebrow, title, description, children }: Props) {
  return <main className="auth-shell">
    <aside className="auth-side">
      <BrandLogo />
      <div className="auth-side-intro">
        <p className="auth-side-eyebrow">Conexões que fazem sentido</p>
        <p className="auth-side-title">Sua comunidade, mais próxima.</p>
        <p className="auth-side-text">Descubra as pessoas que fazem parte do seu universo e entenda como vocês estão conectados.</p>
      </div>
      <AuthGraph />
      <p className="auth-side-foot">Uma rede segura para a sua comunidade.</p>
    </aside>
    <section className="auth-main" aria-labelledby="auth-title">
      <div className="auth-content">
        <p className="auth-eyebrow">{eyebrow}</p>
        <h1 className="auth-heading" id="auth-title">{title}</h1>
        {description && <p className="auth-description">{description}</p>}
        {children}
      </div>
    </section>
  </main>
}
