import { useState } from 'react';

interface MensagemCellProps {
  mensagem: string;
  expandida: boolean;
  onToggle: () => void;
}

export function MensagemCell({ mensagem, expandida, onToggle }: MensagemCellProps) {
  const [copiado, setCopiado] = useState(false);

  const handleCopiar = async () => {
    await navigator.clipboard.writeText(mensagem);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  };

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
      <div className="flex gap-3">
        <button
          type="button"
          className="border-none bg-transparent p-0 text-[13px] text-blue-600 underline hover:text-blue-700"
          onClick={onToggle}
        >
          {expandida ? 'recolher' : 'expandir'}
        </button>
        <button
          type="button"
          className="border-none bg-transparent p-0 text-[13px] text-blue-600 underline hover:text-blue-700"
          onClick={handleCopiar}
        >
          {copiado ? 'copiado!' : 'copiar'}
        </button>
      </div>
    </>
  );
}
