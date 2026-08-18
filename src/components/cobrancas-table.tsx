import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { LinhaCobranca } from '../lib/cobrancas';
import { IndeterminateCheckbox } from './indeterminate-checkbox';
import { MensagemCell } from './mensagem-cell';
import { MensagemStatusBadge } from './mensagem-status-badge';

export type RowSelectionState = Record<number, boolean>;

const ROTULOS = {
  vencimento: 'Vencimento',
  aluno: 'Aluno',
  telefone: 'Telefone',
  total: 'Total',
  mensagem: 'Mensagem',
};

interface CobrancasTableProps {
  linhas: LinhaCobranca[];
  rowSelection: RowSelectionState;
  onRowSelectionChange: Dispatch<SetStateAction<RowSelectionState>>;
}

export function CobrancasTable({ linhas, rowSelection, onRowSelectionChange }: CobrancasTableProps) {
  const [linhaExpandida, setLinhaExpandida] = useState<number | null>(null);

  const totalSelecionadas = linhas.reduce((total, _, index) => total + (rowSelection[index] ? 1 : 0), 0);
  const todasSelecionadas = linhas.length > 0 && totalSelecionadas === linhas.length;
  const algumaSelecionada = totalSelecionadas > 0;

  const toggleTodas = () => {
    const selecionar = !todasSelecionadas;
    onRowSelectionChange(Object.fromEntries(linhas.map((_, index) => [index, selecionar])));
  };

  const toggleLinha = (index: number) => {
    onRowSelectionChange((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr>
            <th className="sticky top-0 w-px whitespace-nowrap border-b border-slate-200 bg-slate-100 px-3.5 py-2.5 text-center align-top font-semibold text-slate-900">
              <IndeterminateCheckbox
                checked={todasSelecionadas}
                indeterminate={algumaSelecionada}
                onChange={toggleTodas}
                aria-label="Selecionar todas as linhas"
              />
            </th>
            <th className="sticky top-0 whitespace-nowrap border-b border-slate-200 bg-slate-100 px-3.5 py-2.5 align-top font-semibold text-slate-900">
              {ROTULOS.vencimento}
            </th>
            <th className="sticky top-0 whitespace-nowrap border-b border-slate-200 bg-slate-100 px-3.5 py-2.5 align-top font-semibold text-slate-900">
              {ROTULOS.aluno}
            </th>
            <th className="sticky top-0 whitespace-nowrap border-b border-slate-200 bg-slate-100 px-3.5 py-2.5 align-top font-semibold text-slate-900 text-nowrap">
              {ROTULOS.telefone}
            </th>
            <th className="sticky top-0 whitespace-nowrap border-b border-slate-200 bg-slate-100 px-3.5 py-2.5 align-top font-semibold text-slate-900 text-nowrap">
              {ROTULOS.total}
            </th>
            <th className="sticky top-0 whitespace-nowrap border-b border-slate-200 bg-slate-100 px-3.5 py-2.5 align-top font-semibold text-slate-900">
              {ROTULOS.mensagem}
            </th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha, index) => (
            <tr key={index} className="last:[&>td]:border-b-0 hover:bg-blue-50">
              <td className="w-px border-b border-slate-200 px-3.5 py-2.5 text-center align-top">
                <IndeterminateCheckbox
                  checked={Boolean(rowSelection[index])}
                  onChange={() => toggleLinha(index)}
                  aria-label={`Selecionar linha de ${linha.responsavel}`}
                />
              </td>
              <td className="border-b border-slate-200 px-3.5 py-2.5 align-top">
                {linha.vencimento}
                {linha.quantidade > 1 && (
                  <span className="ml-1 text-sm text-slate-500">
                    ({linha.quantidade})
                  </span>
                )}
                <div className="mt-1">
                  <MensagemStatusBadge tipo={linha.tipo} />
                </div>
              </td>
              <td className="whitespace-pre-line border-b border-slate-200 px-3.5 py-2.5 align-top">
                {linha.alunos}
                {linha.alunos !== linha.responsavel && (
                  <span className="block text-sm text-slate-500">
                    ({linha.responsavel})
                  </span>
                )}
              </td>
              <td className="border-b border-slate-200 px-3.5 py-2.5 align-top text-nowrap">{linha.telefone}</td>
              <td className="whitespace-nowrap border-b border-slate-200 px-3.5 py-2.5 text-right align-top text-nowrap">
                {linha.total}
              </td>
              <td className="min-w-70 max-w-105 border-b border-slate-200 px-3.5 py-2.5 align-top">
                <MensagemCell
                  mensagem={linha.mensagem}
                  expandida={linhaExpandida === index}
                  onToggle={() => setLinhaExpandida(linhaExpandida === index ? null : index)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
