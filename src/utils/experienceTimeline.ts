import type { Experience } from '../types/profile'

const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export interface TimelineGroup { organization: string; roles: Experience[] }

function formatDate(date: string): string {
  const [year, month] = date.split('-')
  return `${months[Number(month) - 1]}/${year}`
}
export function formatPeriod(start: string, end: string | null): string {
  return `${formatDate(start)} – ${end ? formatDate(end) : 'atual'}`
}
// Mais recente primeiro. Cargos seguidos na mesma organização formam a evolução da pessoa ali.
export function experienceTimeline(experiences: Experience[]): TimelineGroup[] {
  const groups: TimelineGroup[] = []
  for (const item of [...experiences].sort((a, b) => b.start_date.localeCompare(a.start_date))) {
    const last = groups[groups.length - 1]
    if (last?.organization.trim().toLowerCase() === item.organization.trim().toLowerCase()) last.roles.push(item)
    else groups.push({ organization: item.organization, roles: [item] })
  }
  return groups
}
