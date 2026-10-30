const points = [[60, 18], [97, 39], [97, 81], [60, 102], [23, 81], [23, 39]]

export default function LoadingScreen({ message }: { message: string }) {
  return <div className="loading-screen" role="status">
    <svg className="loading-graph" viewBox="0 0 120 120" aria-hidden="true">
      {points.map(([x, y], index) => <line key={index} x1="60" y1="60" x2={x} y2={y} style={{ animationDelay: `${index * .15}s` }} />)}
      {points.map(([x, y], index) => <circle key={index} cx={x} cy={y} r="7" style={{ animationDelay: `${index * .15}s` }} />)}
      <circle className="loading-center" cx="60" cy="60" r="11" />
    </svg>
    <p>{message}</p>
  </div>
}
