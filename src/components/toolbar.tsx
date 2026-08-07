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
  return (
    <div className="toolbar">
      <div className="toolbar__info">
        {totalOrigem} linhas lidas do CSV de origem · {totalLinhas} mensagens geradas · {selecionadasCount}{' '}
        selecionada(s)
      </div>
      <div className="toolbar__actions">
        <button
          type="button"
          className="button button--whatsapp"
          onClick={onEnviarWhatsapp}
          disabled={!algumaSelecionada || enviando}
        >
          {enviando ? 'Enviando…' : `Enviar via WhatsApp (${selecionadasCount})`}
        </button>
        <button type="button" className="button button--primary" onClick={onExportar}>
          Exportar CSV
        </button>
      </div>
    </div>
  );
}
