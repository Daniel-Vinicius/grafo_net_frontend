import type { GraphProfile, PathCost } from '../types/graph'

export function plural(amount: number, singular: string, pluralForm: string): string {
  return `${amount} ${amount === 1 ? singular : pluralForm}`
}
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}
export function describeProfile(profile: GraphProfile): string {
  const job = [profile.role, profile.company].filter(Boolean).join(' na ')
  if (profile.type === 'alumni') return [job, profile.entry_year ? `Alumni ${profile.entry_year}` : 'Alumni'].filter(Boolean).join(' · ')
  if (profile.type === 'professor') return [profile.role, profile.course].filter(Boolean).join(' · ')
  return [profile.course, profile.semester ? `${profile.semester}º semestre` : ''].filter(Boolean).join(' · ')
}
export function describePath(cost: PathCost, contextualLabel: [string, string]): string {
  if (!cost.contextual_edges) return plural(cost.hops, 'conexão próxima', 'conexões próximas')
  return `${plural(cost.hops, 'etapa', 'etapas')} · ${plural(cost.contextual_edges, ...contextualLabel)}`
}
