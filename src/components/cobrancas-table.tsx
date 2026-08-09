import { useMemo, useState } from 'react';
import { createColumnHelper, tableFeatures, useTable, rowSelectionFeature } from '@tanstack/react-table';
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { COLUNAS_SAIDA, type LinhaCobranca } from '../lib/cobrancas';
import { IndeterminateCheckbox } from './indeterminate-checkbox';
import { MensagemCell } from './mensagem-cell';
import { StatusBadge, type StatusEnvio } from './status-badge';

const ROTULOS: Record<(typeof COLUNAS_SAIDA)[number], string> = {
  vencimento: 'Vencimento',
  responsavel: 'Responsável',
  alunos: 'Aluno(s)',
  telefone: 'Telefone',
  total: 'Total',
  mensagem: 'Mensagem',
};

const features = tableFeatures({ rowSelectionFeature });
const columnHelper = createColumnHelper<typeof features, LinhaCobranca>();

interface CobrancasTableProps {
  linhas: LinhaCobranca[];
  rowSelection: RowSelectionState;
  onRowSelectionChange: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  statusEnvio: Record<number, StatusEnvio>;
}

export function CobrancasTable({ linhas, rowSelection, onRowSelectionChange, statusEnvio }: CobrancasTableProps) {
  const [linhaExpandida, setLinhaExpandida] = useState<number | null>(null);

  // TValue is widened to `any`: mixing accessor columns (string) with display columns
  // (unknown) in one array trips ColumnDef's contravariant `footer`/`header` typing otherwise.
  const columns = useMemo<ColumnDef<typeof features, LinhaCobranca, any>[]>(
    () => [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <IndeterminateCheckbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            aria-label="Selecionar todas as linhas"
          />
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            aria-label={`Selecionar linha de ${row.original.responsavel}`}
          />
        ),
      }),
      columnHelper.accessor('vencimento', { header: ROTULOS.vencimento, cell: (info) => info.getValue() }),
      columnHelper.accessor('responsavel', { header: ROTULOS.responsavel, cell: (info) => info.getValue() }),
      columnHelper.accessor('alunos', { header: ROTULOS.alunos, cell: (info) => info.getValue() }),
      columnHelper.accessor('telefone', { header: ROTULOS.telefone, cell: (info) => info.getValue() }),
      columnHelper.accessor('total', { header: ROTULOS.total, cell: (info) => info.getValue() }),
      columnHelper.display({
        id: 'mensagem',
        header: ROTULOS.mensagem,
        cell: ({ row }) => (
          <MensagemCell
            mensagem={row.original.mensagem}
            expandida={linhaExpandida === row.index}
            onToggle={() => setLinhaExpandida(linhaExpandida === row.index ? null : row.index)}
          />
        ),
      }),
      columnHelper.display({
        id: 'status',
        header: 'Envio',
        cell: ({ row }) => <StatusBadge status={statusEnvio[row.index]} />,
      }),
    ],
    [linhaExpandida, statusEnvio],
  );

  const table = useTable({
    key: 'cobrancas-table',
    features,
    columns,
    data: linhas,
    onRowSelectionChange,
    state: { rowSelection },
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={
                    'sticky top-0 whitespace-nowrap border-b border-slate-200 bg-slate-100 px-3.5 py-2.5 align-top font-semibold text-slate-900' +
                    (header.column.id === 'select' ? ' w-px text-center' : '')
                  }
                >
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="last:[&>td]:border-b-0 hover:bg-blue-50">
              {row.getAllCells().map((cell) => (
                <td
                  key={cell.id}
                  className={
                    'border-b border-slate-200 px-3.5 py-2.5 align-top ' +
                    (cell.column.id === 'select'
                      ? 'w-px text-center'
                      : cell.column.id === 'total'
                        ? 'whitespace-nowrap text-right'
                        : cell.column.id === 'mensagem'
                          ? 'min-w-70 max-w-105'
                          : cell.column.id === 'status'
                            ? 'whitespace-nowrap'
                            : '')
                  }
                >
                  <table.FlexRender cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
