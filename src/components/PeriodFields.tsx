interface Props { id: string; start: string; end: string | null; onChange: (start: string, end: string | null) => void }
export default function PeriodFields({ id, start, end, onChange }: Props) {
  // Enquanto "em andamento" estiver marcado o fim fica nulo, como a API espera.
  return <>
    <div className="form-field"><label htmlFor={`${id}-start`}>Início</label><input id={`${id}-start`} type="date" value={start} onChange={e => onChange(e.target.value, end)} required /></div>
    <label className="checkbox-label"><input type="checkbox" checked={end === null} onChange={e => onChange(start, e.target.checked ? null : new Date().toISOString().slice(0, 10))} />Ainda em andamento</label>
    {end !== null && <div className="form-field"><label htmlFor={`${id}-end`}>Fim</label><input id={`${id}-end`} type="date" min={start || undefined} value={end} onChange={e => onChange(start, e.target.value)} required /></div>}
  </>
}
