import { useEffect, useRef } from 'react'
import Icon from '../Icon'

export default function RelationshipModal({ onClose }: { onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    close.current?.focus()
    function keyDown(event: KeyboardEvent) { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', keyDown)
    return () => document.removeEventListener('keydown', keyDown)
  }, [onClose])
  return <div className="modal-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <section className="modal relationship-modal" role="dialog" aria-modal="true" aria-labelledby="relationship-title">
      <button ref={close} className="modal-close" type="button" aria-label="Fechar" onClick={onClose}><Icon name="close" /></button>
      <p className="eyebrow">Vínculos rastreados</p>
      <h2 id="relationship-title">Como o GrafoNet encontra caminhos</h2>
      <p>O e-mail institucional confirma que a pessoa pertence à comunidade. Os demais dados são informados pelos usuários e, quando envolvem outra pessoa, precisam de confirmação.</p>
      <div className="relationship-grid">
        <article className="relationship-card is-close"><span>Prioridade máxima</span><h3>Conexão Próxima</h3><p>Relação recíproca, limitada a 10 pessoas. Caminhos formados somente por essas conexões aparecem primeiro.</p></article>
        <article className="relationship-card"><span>Vínculo contextual</span><h3>Mesma Turma</h3><p>Mesmo curso, mesmo semestre de entrada e mesma sala. Os três dados precisam coincidir.</p></article>
        <article className="relationship-card"><span>Vínculo contextual</span><h3>Mesma Entidade</h3><p>Participação com datas. Para alumni, os períodos precisam se sobrepor. Professores não entram como membros de entidade.</p></article>
        <article className="relationship-card"><span>Vínculo contextual</span><h3>IC</h3><p>Relação entre professor e aluno ou alumni em uma iniciação científica identificada e confirmada.</p></article>
      </div>
      <div className="data-flow-note"><h3>Perfil rápido, completado aos poucos</h3><p><b>Mínimo:</b> categoria — aluno, alumni ou professor — nome, e-mail, curso e dados de turma quando aplicáveis. <b>Completo:</b> foto, resumo, trabalho, experiências, entidades com período e ICs. Quanto mais completo, mais buscas específicas conseguem encontrar o perfil.</p></div>
    </section>
  </div>
}
