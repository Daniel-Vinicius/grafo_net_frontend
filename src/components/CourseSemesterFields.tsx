import type { ProfileInput, ProfileOptions } from '../types/profile'

interface Props {
  value: ProfileInput
  options: ProfileOptions
  onChange: (value: ProfileInput) => void
}

export default function CourseSemesterFields({ value, options, onChange }: Props) {
  const limit = (courseId: string) => options.courses.find(item => item.id === courseId)?.semesters ?? 0
  const semesters = Array.from({ length: limit(value.course_id) }, (_, index) => index + 1)
  function changeCourse(course_id: string) {
    onChange({ ...value, course_id, semester: value.semester <= limit(course_id) ? value.semester : 0 })
  }
  return <>
    <div className="form-field"><label htmlFor="profile-course">Curso</label>
      <select id="profile-course" value={value.course_id} onChange={e => changeCourse(e.target.value)} required>
        <option value="">Selecione o curso</option>{options.courses.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select></div>
    <div className="form-field"><label htmlFor="profile-semester">Semestre</label>
      <select id="profile-semester" value={value.semester || ''} onChange={e => onChange({ ...value, semester: Number(e.target.value) })} disabled={!value.course_id} required>
        <option value="">Selecione o semestre</option>{semesters.map(item => <option key={item} value={item}>{item}º semestre</option>)}
      </select></div>
  </>
}
