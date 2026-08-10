import { useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { lerCSV, toCSV } from '../lib/csv';
import { COLUNAS_SAIDA, gerarLinhas, type LinhaCobranca } from '../lib/cobrancas';
import { enviarWhatsapp } from '../lib/whatsapp';
import { PageHeader } from '../components/page-header';
import { Dropzone } from '../components/dropzone';
import { Alerta } from '../components/alerta';
import { Toolbar } from '../components/toolbar';
import { CobrancasTable, type RowSelectionState } from '../components/cobrancas-table';
import type { StatusEnvio } from '../components/status-badge';

export const Route = createFileRoute('/')({ component: App });

function baixarArquivo(conteudo: string, nomeArquivo: string) {
  const blob = new Blob(['﻿' + conteudo], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function App() {
  const enviar = useServerFn(enviarWhatsapp);

  const [linhas, setLinhas] = useState<LinhaCobranca[]>([]);
  const [nomeArquivo, setNomeArquivo] = useState('');
  const [totalOrigem, setTotalOrigem] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [statusEnvio, setStatusEnvio] = useState<Record<number, StatusEnvio>>({});
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  async function processarArquivo(file: File) {
    setErro(null);
    try {
      const rows = await lerCSV(file);
      if (rows.length === 0) {
        throw new Error('O CSV não tem linhas de dados.');
      }
      const colunasEsperadas = ['Entidade - Nome', 'Status', 'Vencimento', 'Valor com desconto'];
      const faltando = colunasEsperadas.filter((c) => !(c in rows[0]));
      if (faltando.length > 0) {
        throw new Error('Colunas ausentes no CSV: ' + faltando.join(', '));
      }
      const result = gerarLinhas(rows);
      setLinhas(result);
      setTotalOrigem(rows.length);
      setNomeArquivo(file.name);
      setRowSelection(Object.fromEntries(result.map((_, idx) => [idx, true])));
      setStatusEnvio({});
      setErroEnvio(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao processar o CSV.');
      setLinhas([]);
    }
  }

  const handleLimpar = () => {
    setLinhas([]);
    setNomeArquivo('');
    setTotalOrigem(0);
    setErro(null);
    setRowSelection({});
    setStatusEnvio({});
    setErroEnvio(null);
  };

  const handleExportar = () => {
    const csv = toCSV(COLUNAS_SAIDA, linhas, ';');
    const base = nomeArquivo.replace(/\.csv$/i, '') || 'cobrancas';
    baixarArquivo(csv, base + '-cobrancas.csv');
  };

  const selecionadas = useMemo(
    () => linhas.map((linha, index) => ({ index, linha })).filter(({ index }) => rowSelection[index]),
    [linhas, rowSelection],
  );
  const algumaSelecionada = selecionadas.length > 0;

  const handleEnviarWhatsapp = async () => {
    if (selecionadas.length === 0) return;

    const confirmado = window.confirm(
      `Enviar ${selecionadas.length} mensagem(ns) via WhatsApp agora? Essa ação envia mensagens reais e não pode ser desfeita.`,
    );
    if (!confirmado) return;

    setErroEnvio(null);
    setEnviando(true);
    const indices = selecionadas.map(({ index }) => index);
    setStatusEnvio((prev) => {
      const next = { ...prev };
      for (const idx of indices) next[idx] = 'enviando';
      return next;
    });

    try {
      const items = selecionadas.map(({ index, linha }) => ({
        index,
        telefone: linha.telefone,
        mensagem: linha.mensagem,
      }));
      const resultados = await enviar({ data: { items } });
      setStatusEnvio((prev) => {
        const next = { ...prev };
        for (const r of resultados) next[r.index] = r;
        return next;
      });
    } catch (e) {
      setErroEnvio(e instanceof Error ? e.message : 'Falha ao enviar mensagens.');
      setStatusEnvio((prev) => {
        const next = { ...prev };
        for (const idx of indices) delete next[idx];
        return next;
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="box-border mx-auto flex w-full max-w-350 flex-col gap-5 px-6 pt-8 pb-16">
      <PageHeader />

      <Dropzone nomeArquivo={nomeArquivo} onFileSelected={processarArquivo} onLimpar={handleLimpar} />

      {erro && <Alerta mensagem={erro} />}
      {erroEnvio && <Alerta mensagem={erroEnvio} />}

      {linhas.length > 0 && (
        <>
          <Toolbar
            totalOrigem={totalOrigem}
            totalLinhas={linhas.length}
            selecionadasCount={selecionadas.length}
            enviando={enviando}
            algumaSelecionada={algumaSelecionada}
            onEnviarWhatsapp={handleEnviarWhatsapp}
            onExportar={handleExportar}
          />

          <CobrancasTable
            linhas={linhas}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            statusEnvio={statusEnvio}
          />
        </>
      )}
    </div>
  );
}
