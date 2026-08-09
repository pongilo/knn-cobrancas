interface MensagemCellProps {
  mensagem: string;
  expandida: boolean;
  onToggle: () => void;
}

export function MensagemCell({ mensagem, expandida, onToggle }: MensagemCellProps) {
  return (
    <>
      <pre
        className={
          'm-0 mb-1 overflow-hidden whitespace-pre-wrap wrap-break-word font-sans text-[13px] text-slate-600 ' +
          (expandida ? 'max-h-none' : 'max-h-[3.2em]')
        }
      >
        {mensagem}
      </pre>
      <button
        type="button"
        className="border-none bg-transparent p-0 text-[13px] text-blue-600 underline hover:text-blue-700"
        onClick={onToggle}
      >
        {expandida ? 'recolher' : 'expandir'}
      </button>
    </>
  );
}
