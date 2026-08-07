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
    <div className="table-wrap">
      <table className="table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className={header.column.id === 'select' ? 'col-checkbox' : undefined}>
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getAllCells().map((cell) => (
                <td
                  key={cell.id}
                  className={
                    cell.column.id === 'select'
                      ? 'col-checkbox'
                      : cell.column.id === 'total'
                        ? 'col-right'
                        : cell.column.id === 'mensagem'
                          ? 'col-mensagem'
                          : cell.column.id === 'status'
                            ? 'col-status'
                            : undefined
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
