import { useEffect, useRef, useState, type PointerEvent } from 'react'
import type { GraphEdge } from '../../types/graph'
import type { Profile } from '../../types/profile'
import { stageSize, type Point } from '../../utils/graphLayout'
import GraphEdgeLine from './GraphEdgeLine'
import GraphNode from './GraphNode'

export interface GraphLink { edge: GraphEdge; from: string; to: string; path: boolean }
export interface GraphScene { nodes: Profile[]; links: GraphLink[]; positions: Map<string, Point>; faded: Set<string> }
interface Props { scene: GraphScene; meId: string; selectedId: string | null; onSelect: (id: string) => void }

const initialView = { x: 0, y: 0, ...stageSize }
const arrows = { linkArrow: '#b9c0c7', linkContextArrow: '#cfd3d7', pathArrow: '#e31b23', pathContextArrow: '#e8878c' }

export default function NetworkGraph({ scene, meId, selectedId, onSelect }: Props) {
  const svg = useRef<SVGSVGElement>(null)
  const drag = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null)
  const [view, setView] = useState(initialView)
  const [dragging, setDragging] = useState(false)
  useEffect(() => {
    const element = svg.current
    if (!element) return
    function wheel(event: WheelEvent) {
      event.preventDefault()
      setView(current => {
        const width = Math.max(650, Math.min(1500, current.width * (event.deltaY > 0 ? 1.1 : .9)))
        const height = width * (stageSize.height / stageSize.width)
        return { x: current.x + (current.width - width) / 2, y: current.y + (current.height - height) / 2, width, height }
      })
    }
    // O React registra onWheel como passivo, o que impediria o preventDefault.
    element.addEventListener('wheel', wheel, { passive: false })
    return () => element.removeEventListener('wheel', wheel)
  }, [])
  function pointerDown(event: PointerEvent<SVGSVGElement>) {
    if ((event.target as Element).closest('.person-node')) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { x: event.clientX, y: event.clientY, startX: view.x, startY: view.y }
    setDragging(true)
  }
  function pointerMove(event: PointerEvent<SVGSVGElement>) {
    const start = drag.current
    if (!start) return
    const { clientWidth, clientHeight } = event.currentTarget
    setView(current => ({
      ...current,
      x: start.startX - (event.clientX - start.x) * (current.width / clientWidth),
      y: start.startY - (event.clientY - start.y) * (current.height / clientHeight),
    }))
  }
  function endDrag() { drag.current = null; setDragging(false) }
  return <svg ref={svg} className={`network-graph${dragging ? ' is-dragging' : ''}`} viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`} role="img" aria-label="Grafo das conexões do usuário" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}>
    <defs>{Object.entries(arrows).map(([id, fill]) => <marker key={id} id={id} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto-start-reverse" markerUnits="strokeWidth"><path d="M0,0 L8,4 L0,8 z" fill={fill} /></marker>)}</defs>
    <g>{scene.links.map(link => <GraphEdgeLine key={link.edge.id} edge={link.edge} from={scene.positions.get(link.from)!} to={scene.positions.get(link.to)!} path={link.path} />)}</g>
    <g>{scene.nodes.map(node => <GraphNode key={node.id} profile={node} point={scene.positions.get(node.id)!} me={node.id === meId} faded={scene.faded.has(node.id)} selected={node.id === selectedId} onSelect={onSelect} />)}</g>
  </svg>
}
