export interface Option { id: string; name: string }
export interface Course extends Option { semesters: number }
export interface ProfileOptions {
  courses: Course[]
  fields: Option[]
  semesters: number[]
  statuses: string[]
  types: string[]
}
export interface ProfileInput {
  name: string
  course_id: string
  semester: number
  field_id: string
  bio: string
}
export interface ProfileDetails {
  type: '' | 'aluno' | 'alumni' | 'professor'
  entry_year: number | null
  entry_semester: number | null
  class_group: string
  role: string
  company: string
}
export interface Experience {
  id: string
  title: string
  organization: string
  type: string
  start_date: string
  end_date: string | null
  description: string
}
export interface Membership {
  id: string
  entity_id: string
  role: string
  start_date: string
  end_date: string | null
}
// O servidor gera o id de itens novos; os existentes precisam reenviá-lo.
export type ExperienceInput = Omit<Experience, 'id'> & { id?: string }
export type MembershipInput = Omit<Membership, 'id'> & { id?: string }
export interface Profile extends ProfileInput, ProfileDetails {
  id: string
  course: string
  field: string
  photo_id: string | null
  photo_url: string | null
  entity_ids: string[]
  research_project_ids: string[]
  experiences_completed: boolean
  entities: Option[]
  research_projects: Project[]
  experiences: Experience[]
  entity_memberships: Membership[]
}
export interface ProfileUpdate extends Partial<ProfileInput>, Partial<ProfileDetails> {
  entity_ids?: string[]
  research_project_ids?: string[]
  experiences_completed?: boolean
  experiences?: ExperienceInput[]
  entity_memberships?: MembershipInput[]
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
export const typeLabels: Record<string, string> = { aluno: 'Aluno', alumni: 'Alumni', professor: 'Professor' }
export const statusLabels: Record<string, string> = {
  planned: 'Planejado', in_progress: 'Em andamento', completed: 'Concluído', cancelled: 'Cancelado',
}
