import type { ProfileInput, ProfileOptions } from '../types/profile'
import CourseSemesterFields from './CourseSemesterFields'

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
    <CourseSemesterFields value={value} options={options} onChange={onChange} />
    <div className="form-field"><label htmlFor="profile-field">Área de atuação</label>
      <select id="profile-field" value={value.field_id} onChange={e => set('field_id', e.target.value)}>
        <option value="">Selecione a área</option>{options.fields.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select></div>
    <div className="form-field"><label htmlFor="profile-bio">Bio</label>
      <textarea id="profile-bio" value={value.bio} onChange={e => set('bio', e.target.value)} maxLength={500} rows={4} />
      <small>{value.bio.length}/500 caracteres</small></div>
  </>
}
