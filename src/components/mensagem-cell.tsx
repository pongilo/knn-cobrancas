interface MensagemCellProps {
  mensagem: string;
  expandida: boolean;
  onToggle: () => void;
}

export function MensagemCell({ mensagem, expandida, onToggle }: MensagemCellProps) {
  return (
    <>
      <pre className={expandida ? 'mensagem mensagem--expandida' : 'mensagem'}>{mensagem}</pre>
      <button type="button" className="button button--link" onClick={onToggle}>
        {expandida ? 'recolher' : 'expandir'}
      </button>
    </>
  );
}
