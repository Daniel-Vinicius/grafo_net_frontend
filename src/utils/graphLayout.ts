export interface Point { x: number; y: number }

export const stageSize = { width: 1040, height: 680 }
const center = { x: 520, y: 330 }
const radii = [235, 245, 230, 250, 230, 250, 230, 245, 235, 245]
// A visão de caminho começa depois do painel de resultados, que flutua à esquerda.
const pathStart = 430
const pathEnd = 970
const pathY = 340
const friendRows = [150, 545]

const avatarColors = ['#b4232a', '#2f4858', '#55606e', '#7a4a2b', '#3d6b57', '#5b4a8a']
export function avatarColor(id: string): string {
  return avatarColors[[...id].reduce((sum, character) => sum + character.charCodeAt(0), 0) % avatarColors.length]
}
export function ringLayout(centerId: string, ids: string[]): Map<string, Point> {
  const positions = new Map<string, Point>([[centerId, center]])
  ids.forEach((id, index) => {
    const angle = -Math.PI / 2 + index * (Math.PI * 2 / ids.length)
    const radius = radii[index % radii.length]
    positions.set(id, { x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * (radius * .9) })
  })
  return positions
}
export function pathLayout(ids: string[]): Map<string, Point> {
  const step = (pathEnd - pathStart) / Math.max(ids.length - 1, 1)
  return new Map(ids.map((id, index) => [id, { x: pathStart + index * step, y: pathY + (index % 2 ? -20 : 20) }]))
}
// Conexões que não estão no caminho ficam em volta dele, alternando acima e abaixo.
export function friendsLayout(ids: string[]): Map<string, Point> {
  const columns = Math.ceil(ids.length / 2)
  const step = (pathEnd - pathStart + 80) / Math.max(columns, 1)
  return new Map(ids.map((id, index) => {
    const column = Math.floor(index / 2)
    return [id, { x: pathStart - 40 + step * (column + .5), y: friendRows[index % 2] + (column % 2 ? 22 : 0) * (index % 2 ? 1 : -1) }]
  }))
}
