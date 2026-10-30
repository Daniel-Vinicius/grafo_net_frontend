import { typeLabels, type ProfileDetails, type ProfileOptions } from '../types/profile'

interface Props { value: ProfileDetails; options: ProfileOptions; onChange: (value: ProfileDetails) => void }
export default function ProfileDetailsFields({ value, options, onChange }: Props) {
  function set<K extends keyof ProfileDetails>(key: K, next: ProfileDetails[K]) { onChange({ ...value, [key]: next }) }
  return <>
    <div className="form-field"><label htmlFor="profile-type">Categoria</label>
      <select id="profile-type" value={value.type} onChange={e => set('type', e.target.value as ProfileDetails['type'])}>
        <option value="">Selecione a categoria</option>{options.types.map(item => <option key={item} value={item}>{typeLabels[item]}</option>)}
      </select></div>
    {value.type !== 'professor' && <>
      <div className="form-field"><label htmlFor="profile-entry-year">Ano de entrada</label>
        <input id="profile-entry-year" type="number" min={1900} max={2200} value={value.entry_year ?? ''} onChange={e => set('entry_year', e.target.value ? Number(e.target.value) : null)} /></div>
      <div className="form-field"><label htmlFor="profile-entry-semester">Semestre de entrada</label>
        <select id="profile-entry-semester" value={value.entry_semester ?? ''} onChange={e => set('entry_semester', e.target.value ? Number(e.target.value) : null)}>
          <option value="">Selecione o semestre</option><option value="1">1º semestre</option><option value="2">2º semestre</option>
        </select></div>
      <div className="form-field"><label htmlFor="profile-class">Sala</label>
        <input id="profile-class" value={value.class_group} onChange={e => set('class_group', e.target.value)} maxLength={150} />
        <small>Curso, entrada e sala iguais formam o vínculo de Mesma Turma.</small></div>
    </>}
    <div className="form-field"><label htmlFor="profile-role">Cargo atual</label>
      <input id="profile-role" value={value.role} onChange={e => set('role', e.target.value)} maxLength={150} /></div>
    <div className="form-field"><label htmlFor="profile-company">Empresa</label>
      <input id="profile-company" value={value.company} onChange={e => set('company', e.target.value)} maxLength={150} /></div>
  </>
}
