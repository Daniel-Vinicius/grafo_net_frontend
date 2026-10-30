import type { Profile } from '../types/profile'

export function profileCompleteness(profile: Profile): number {
  const checks = [
    Boolean(profile.photo_id),
    Boolean(profile.bio),
    Boolean(profile.field_id),
    Boolean(profile.type),
    profile.experiences.length > 0,
    profile.entity_ids.length + profile.research_project_ids.length > 0,
  ]
  if (profile.type !== 'professor') checks.push(Boolean(profile.entry_year && profile.entry_semester && profile.class_group))
  return Math.round(checks.filter(Boolean).length / checks.length * 100)
}
