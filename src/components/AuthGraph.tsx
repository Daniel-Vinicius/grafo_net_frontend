const nodes = [
  { id: 'BM', x: 120, y: 60 }, { id: 'LN', x: 480, y: 50 }, { id: 'AR', x: 300, y: 130 }, { id: 'JP', x: 50, y: 170 },
  { id: 'MA', x: 560, y: 165 }, { id: 'CR', x: 150, y: 260 }, { id: 'RA', x: 500, y: 250 },
]
const links = [['BM', 'AR'], ['LN', 'AR'], ['JP', 'BM'], ['JP', 'CR'], ['CR', 'AR'], ['AR', 'RA'], ['LN', 'MA'], ['MA', 'RA']]
const position = (id: string) => nodes.find(node => node.id === id)!

export default function AuthGraph() {
  return <svg className="auth-graph" viewBox="0 0 610 310" aria-hidden="true">
    {links.map(([from, to]) => <line key={from + to} x1={position(from).x} y1={position(from).y} x2={position(to).x} y2={position(to).y} />)}
    {nodes.map(node => <g key={node.id} className={node.id === 'AR' ? 'is-center' : undefined}>
      <circle cx={node.x} cy={node.y} r="30" /><text x={node.x} y={node.y}>{node.id}</text>
    </g>)}
  </svg>
}
