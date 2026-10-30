export default function SearchLoading() {
  return <div className="results-panel" role="status">
    <div className="results-head"><div><span>Buscando pessoas...</span><small>Procurando os melhores caminhos na rede</small></div></div>
    <div className="result-list" aria-hidden="true">
      {[0, 1, 2, 3].map(item => <div className="result-skeleton" key={item}><i /><span><b /><small /></span></div>)}
    </div>
  </div>
}
