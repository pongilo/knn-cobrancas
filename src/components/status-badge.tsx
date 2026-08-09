import type { ResultadoEnvio } from '../lib/whatsapp';

export type StatusEnvio = 'enviando' | ResultadoEnvio;

export function StatusBadge({ status }: { status: StatusEnvio | undefined }) {
  if (!status) return null;

  const base = 'inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold';

  if (status === 'enviando') {
    return <span className={base + ' bg-slate-100 text-slate-600'}>enviando…</span>;
  }

  if (status.ok) {
    return (
      <span className={base + ' bg-green-100 text-green-700'} title={status.status || ''}>
        enviada
      </span>
    );
  }

  return (
    <span className={base + ' cursor-help bg-red-100 text-red-600'} title={status.error || ''}>
      erro
    </span>
  );
}
