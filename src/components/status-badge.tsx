import type { ResultadoEnvio } from '../lib/whatsapp';

export type StatusEnvio = 'enviando' | ResultadoEnvio;

export function StatusBadge({ status }: { status: StatusEnvio | undefined }) {
  if (!status) return null;

  if (status === 'enviando') {
    return <span className="badge badge--pendente">enviando…</span>;
  }

  if (status.ok) {
    return (
      <span className="badge badge--sucesso" title={status.status || ''}>
        enviada
      </span>
    );
  }

  return (
    <span className="badge badge--erro" title={status.error || ''}>
      erro
    </span>
  );
}
