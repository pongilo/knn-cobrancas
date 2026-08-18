import type { TipoMensagem } from '../lib/messages';

const ROTULOS: Record<TipoMensagem, string> = {
  tresDiasAntes: 'Vence em 3 dias',
  hoje: 'Vence hoje',
  carencia: 'Em carência',
  atraso: 'Atrasado',
  muitoAtraso: 'Muito atrasado',
  invalida: 'Data inválida',
};

const CORES: Record<TipoMensagem, string> = {
  tresDiasAntes: 'bg-blue-100 text-blue-700',
  hoje: 'bg-amber-100 text-amber-700',
  carencia: 'bg-orange-100 text-orange-700',
  atraso: 'bg-red-100 text-red-700',
  muitoAtraso: 'bg-red-200 text-red-900',
  invalida: 'bg-slate-100 text-slate-600',
};

export function MensagemStatusBadge({ tipo }: { tipo: TipoMensagem }) {
  return (
    <span className={'inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold text-nowrap ' + CORES[tipo]}>
      {ROTULOS[tipo]}
    </span>
  );
}
