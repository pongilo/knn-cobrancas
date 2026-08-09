interface ToolbarProps {
  totalOrigem: number;
  totalLinhas: number;
  selecionadasCount: number;
  enviando: boolean;
  algumaSelecionada: boolean;
  onEnviarWhatsapp: () => void;
  onExportar: () => void;
}

export function Toolbar({
  totalOrigem,
  totalLinhas,
  selecionadasCount,
  enviando,
  algumaSelecionada,
  onEnviarWhatsapp,
  onExportar,
}: ToolbarProps) {
  const buttonBase =
    'cursor-pointer rounded-lg border border-transparent px-4.5 py-2.5 text-[15px] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-55';

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="text-[15px] text-slate-600">
        {totalOrigem} linhas lidas do CSV de origem · {totalLinhas} mensagens geradas · {selecionadasCount}{' '}
        selecionada(s)
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          className={buttonBase + ' bg-[#25d366] font-semibold text-[#06301b]'}
          onClick={onEnviarWhatsapp}
          disabled={!algumaSelecionada || enviando}
        >
          {enviando ? 'Enviando…' : `Enviar via WhatsApp (${selecionadasCount})`}
        </button>
        <button type="button" className={buttonBase + ' bg-blue-500 text-white'} onClick={onExportar}>
          Exportar CSV
        </button>
      </div>
    </div>
  );
}
