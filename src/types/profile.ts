export interface Option { id: string; name: string }
export interface Course extends Option { semesters: number }
export interface ProfileOptions {
  courses: Course[]
  fields: Option[]
  semesters: number[]
  statuses: string[]
}
export interface ProfileInput {
  name: string
  course_id: string
  semester: number
  field_id: string
  bio: string
}
export interface Profile extends ProfileInput {
  id: string
  photo_id: string | null
  entity_ids: string[]
  research_project_ids: string[]
  experiences_completed: boolean
}
export interface ProjectInput {
  title: string
  description: string
  advisor: string
  field_id: string
  start_date: string
  end_date: string | null
  status: string
}
export interface Project extends ProjectInput {
  id: string
  creator_id: string | null
}
export const emptyProfile: ProfileInput = { name: '', course_id: '', semester: 0, field_id: '', bio: '' }
export const emptyProject: ProjectInput = {
  title: '', description: '', advisor: '', field_id: '', start_date: '', end_date: null, status: 'planned',
}
export const statusLabels: Record<string, string> = {
  planned: 'Planejado', in_progress: 'Em andamento', completed: 'Concluído', cancelled: 'Cancelado',
}
