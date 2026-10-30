import type { GraphEdge } from '../../types/graph'
import type { Point } from '../../utils/graphLayout'

interface Props { edge: GraphEdge; from: Point; to: Point; path: boolean }
export default function GraphEdgeLine({ edge, from, to, path }: Props) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.hypot(dx, dy) || 1
  const ux = dx / length
  const uy = dy / length
  const contextual = edge.type !== 'close'
  const marker = `${path ? 'path' : 'link'}${contextual ? 'Context' : ''}Arrow`
  return <>
    <line className={`graph-edge${contextual ? ' contextual' : ''}${path ? ' path' : ''}`} x1={from.x + ux * 42} y1={from.y + uy * 42} x2={to.x - ux * 43} y2={to.y - uy * 43} markerStart={`url(#${marker})`} markerEnd={`url(#${marker})`} />
    {contextual && path && <text className="context-edge-label" x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 10}>{edge.context.label}</text>}
  </>
}
