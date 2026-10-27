import type { ProfileInput, ProfileOptions } from '../types'

interface Props {
  value: ProfileInput
  options: ProfileOptions
  onChange: (value: ProfileInput) => void
}
export default function ProfileFields({ value, options, onChange }: Props) {
  function set<K extends keyof ProfileInput>(key: K, next: ProfileInput[K]) {
    onChange({ ...value, [key]: next })
  }
  return <>
    <div className="form-field"><label htmlFor="profile-name">Nome</label>
      <input id="profile-name" autoComplete="name" value={value.name} onChange={e => set('name', e.target.value)} maxLength={100} required /></div>
    <div className="form-field"><label htmlFor="profile-course">Curso</label>
      <select id="profile-course" value={value.course_id} onChange={e => set('course_id', e.target.value)} required>
        <option value="">Selecione o curso</option>{options.courses.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select></div>
    <div className="form-field"><label htmlFor="profile-semester">Semestre</label>
      <select id="profile-semester" value={value.semester || ''} onChange={e => set('semester', Number(e.target.value))} required>
        <option value="">Selecione o semestre</option>{options.semesters.map(item => <option key={item} value={item}>{item}º semestre</option>)}
      </select></div>
    <div className="form-field"><label htmlFor="profile-field">Área de atuação</label>
      <select id="profile-field" value={value.field_id} onChange={e => set('field_id', e.target.value)} required>
        <option value="">Selecione a área</option>{options.fields.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select></div>
    <div className="form-field"><label htmlFor="profile-bio">Bio</label>
      <textarea id="profile-bio" value={value.bio} onChange={e => set('bio', e.target.value)} maxLength={500} rows={4} required />
      <small>{value.bio.length}/500 caracteres</small></div>
  </>
}
