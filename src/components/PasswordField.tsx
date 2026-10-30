import { useState } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
  autoComplete: 'current-password' | 'new-password'
  placeholder: string
  minLength?: number
}

export default function PasswordField({ value, onChange, autoComplete, placeholder, minLength }: Props) {
  const [visible, setVisible] = useState(false)
  return <div className="form-field">
    <label htmlFor="password">Senha</label>
    <div className="input-group">
      <input id="password" name="password" type={visible ? 'text' : 'password'} autoComplete={autoComplete} placeholder={placeholder}
        value={value} onChange={e => onChange(e.target.value)} minLength={minLength} required />
      <button className="input-toggle" type="button" aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={visible} onClick={() => setVisible(v => !v)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />{visible && <path d="m3 3 18 18" />}</svg>
      </button>
    </div>
  </div>
}
