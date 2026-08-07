// Logica portada do node de Code do n8n ("Ler Planilha de Origem" -> mensagens de cobranca).

import { montarMensagem, type TipoMensagem } from './messages';

export type LinhaOrigem = Record<string, string>;

export interface LinhaCobranca {
  vencimento: string;
  responsavel: string;
  alunos: string;
  telefone: string;
  total: string;
  mensagem: string;
}

export const COLUNAS_SAIDA: (keyof LinhaCobranca)[] = [
  'vencimento',
  'responsavel',
  'alunos',
  'telefone',
  'total',
  'mensagem',
];

interface Aluno {
  aluno: string;
  vencimento: string;
  alunoCel: string;
  responsavel: string;
  respCel: string;
  total: number;
}

interface LinhaInterna extends LinhaCobranca {
  _ordem: number;
  _dataOrdenacao: number;
}

interface AlunoClassificado extends Aluno {
  tipo: TipoMensagem;
  ordem: number;
}

function fmt(n: number): string {
  const parts = n.toFixed(2).split('.');
  const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return int + ',' + parts[1];
}

function toNumber(v: unknown): number {
  if (v === null || v === undefined) return 0;
  let s = String(v).trim();
  if (s === '') return 0;
  if (s.indexOf(',') > -1 && s.indexOf('.') > -1) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (s.indexOf(',') > -1) {
    s = s.replace(',', '.');
  }
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function normalizarStatus(s: unknown): string {
  return String(s || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

// Converte "dd/MM/yyyy" em valor numerico ordenavel (yyyyMMdd). Retorna Infinity se invalida.
function dataParaOrdenacao(s: string): number {
  const t = String(s || '').trim();
  const p = t.split('/');
  if (p.length !== 3) return Infinity;
  const d = parseInt(p[0], 10);
  const m = parseInt(p[1], 10);
  const y = parseInt(p[2], 10);
  if (isNaN(d) || isNaN(m) || isNaN(y)) return Infinity;
  return y * 10000 + m * 100 + d;
}

// "Hoje" no fuso America/Sao_Paulo, como dia UTC (sem hora).
function hojeSaoPaulo(): number {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  return Date.UTC(get('year'), get('month') - 1, get('day'));
}

// Diferenca em dias entre o vencimento e hoje (venc - hoje). Positivo = ainda vai vencer.
function diasAteVencimento(s: string, hojeUTC: number): number | null {
  const t = String(s || '').trim();
  const p = t.split('/');
  if (p.length !== 3) return null;
  const d = parseInt(p[0], 10);
  const m = parseInt(p[1], 10);
  const y = parseInt(p[2], 10);
  if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
  const vencUTC = Date.UTC(y, m - 1, d);
  return Math.round((vencUTC - hojeUTC) / 86400000);
}

// 'futuro' e uma classificacao interna (parcela distante demais para ser cobrada agora)
// que nunca chega a virar mensagem, entao nao faz parte de TipoMensagem.
type Tipo = TipoMensagem | 'futuro';

function classificarGrupo(diff: number | null): { ordem: number; tipo: Tipo } {
  if (diff === null) return { ordem: 99, tipo: 'invalida' };
  if (diff <= -2) return { ordem: 1, tipo: 'atraso' };
  if (diff === -1) return { ordem: 2, tipo: 'carencia' };
  if (diff === 0) return { ordem: 3, tipo: 'hoje' };
  if (diff === 1) return { ordem: 4, tipo: 'umDiaAntes' };
  if (diff === 2) return { ordem: 5, tipo: 'doisDiasAntes' };
  if (diff === 3) return { ordem: 6, tipo: 'tresDiasAntes' };
  return { ordem: 7, tipo: 'futuro' }; // sera descartado, nao e mais cobrado
}

function montarBlocoValor(soma: number): string {
  return `R$ ${fmt(soma)}`;
}

// Monta o bloco de valor itemizado: lista cada parcela (vencida ou a vencer) com sua data, e o total.
// Usado quando o responsavel tem ao menos uma parcela em atraso, juntando nela tudo que
// ainda esta pendente (mesmo o que ainda vai vencer), para nao mandar avisos separados.
function montarBlocoValorItemizado(membros: AlunoClassificado[], soma: number): string {
  const nomesDistintos = new Set(membros.map((m) => m.aluno));
  const linhas = membros
    .map((m) => {
      const prefixo = nomesDistintos.size > 1 ? `${m.aluno} - ` : '';
      return `${prefixo} ${m.vencimento}: R$ ${fmt(m.total)}`;
    })
    .join('\n');
  return `\n${linhas}\nTotal: R$ ${fmt(soma)}`;
}

export function gerarLinhas(rows: LinhaOrigem[]): LinhaCobranca[] {
  const hojeUTC = hojeSaoPaulo();

  // 1) Agregar total devido por aluno + vencimento (somente parcelas com status "em aberto").
  // Parcelas do mesmo aluno com vencimentos diferentes NAO podem ser somadas juntas,
  // senao o total exibido mistura valores que vencem em datas diferentes.
  const students: Record<string, Aluno> = {};
  for (const r of rows) {
    const aluno = String(r['Entidade - Nome'] || '').trim();
    if (!aluno) continue;

    const status = normalizarStatus(r['Status']);
    if (status !== 'em aberto') continue;

    const alunoCel = String(r['Aluno - Celular'] || '').trim();
    const resp = String(r['Responsável Financeiro'] || '').trim();
    const respCel = String(r['Responsável - Celular'] || '').trim();
    const venc = String(r['Vencimento'] || '').trim();
    const valor = toNumber(r['Valor com desconto']);

    const key = aluno + '::' + venc;
    if (!students[key]) {
      students[key] = { aluno, vencimento: venc, alunoCel, responsavel: resp, respCel, total: 0 };
    }
    const st = students[key];
    st.total += valor;
    if (resp && !st.responsavel) st.responsavel = resp;
    if (respCel && !st.respCel) st.respCel = respCel;
    if (alunoCel && !st.alunoCel) st.alunoCel = alunoCel;
  }

  // 2) Classifica cada parcela (aluno + vencimento) individualmente e descarta as futuras
  // (mais de 3 dias de antecedencia, ainda nao ha cobranca para esse caso).
  const entradas: AlunoClassificado[] = [];
  for (const key in students) {
    const st = students[key];
    const diff = diasAteVencimento(st.vencimento, hojeUTC);
    const classificacao = classificarGrupo(diff);
    if (classificacao.tipo === 'futuro') continue;
    entradas.push({ ...st, tipo: classificacao.tipo, ordem: classificacao.ordem });
  }

  // 3) Agrupa por responsavel (se nao houver, o proprio aluno e o responsavel).
  // Se o responsavel tiver alguma parcela em atraso, TODAS as parcelas pendentes dele
  // (vencidas ou ainda a vencer) entram numa unica mensagem — assim quem ja esta com uma
  // cobranca vencida nao recebe um aviso separado so porque outra parcela ainda vai vencer.
  // Sem parcela em atraso, os avisos so se juntam quando caem exatamente na mesma data,
  // senao a mensagem ficaria com uma data que nao corresponde ao valor total.
  const porResponsavel: Record<string, AlunoClassificado[]> = {};
  for (const e of entradas) {
    const temResp = e.responsavel.length > 0;
    const responsavelKey = temResp ? 'resp::' + e.responsavel.toLowerCase() : 'aluno::' + e.aluno.toLowerCase();
    if (!porResponsavel[responsavelKey]) porResponsavel[responsavelKey] = [];
    porResponsavel[responsavelKey].push(e);
  }

  const groups: Record<string, AlunoClassificado[]> = {};
  for (const responsavelKey in porResponsavel) {
    const entradasResp = porResponsavel[responsavelKey];
    const temAtraso = entradasResp.some((e) => e.tipo === 'atraso');
    if (temAtraso) {
      groups[responsavelKey + '::atraso'] = entradasResp;
      continue;
    }
    for (const e of entradasResp) {
      const gkey = responsavelKey + '::' + e.vencimento;
      if (!groups[gkey]) groups[gkey] = [];
      groups[gkey].push(e);
    }
  }

  // 4) Uma linha por grupo
  const linhas: LinhaInterna[] = [];
  for (const gkey in groups) {
    const members = groups[gkey]
      .slice()
      .sort((a, b) => dataParaOrdenacao(a.vencimento) - dataParaOrdenacao(b.vencimento));
    const first = members[0];
    const temResp = first.responsavel.length > 0;
    const responsavel = temResp ? first.responsavel : first.aluno;
    let telefone = '';
    for (const m of members) {
      if (temResp && m.respCel) {
        telefone = m.respCel;
        break;
      }
      if (!temResp && m.alunoCel) {
        telefone = m.alunoCel;
        break;
      }
    }
    if (!telefone) telefone = first.alunoCel;

    const soma = members.reduce((a, b) => a + b.total, 0);
    const venc = first.vencimento; // parcela mais antiga do grupo
    const alunosNomes = [...new Set(members.map((m) => m.aluno))].join(', ');

    const valorBloco = first.tipo === 'atraso' ? montarBlocoValorItemizado(members, soma) : montarBlocoValor(soma);
    const mensagem = montarMensagem(first.tipo, venc, valorBloco);

    linhas.push({
      _ordem: first.ordem,
      _dataOrdenacao: dataParaOrdenacao(venc),
      vencimento: venc,
      responsavel,
      alunos: alunosNomes,
      telefone,
      total: `R$ ${fmt(soma)}`,
      mensagem,
    });
  }

  // Ordena por grupo (ordem logica) e, dentro do grupo, por data crescente
  linhas.sort((a, b) => {
    if (a._ordem !== b._ordem) return a._ordem - b._ordem;
    if (a._dataOrdenacao !== b._dataOrdenacao) return a._dataOrdenacao - b._dataOrdenacao;
    return a.responsavel.localeCompare(b.responsavel, 'pt-BR');
  });

  // 4) Saida final apenas com as colunas solicitadas
  return linhas.map((l) => ({
    vencimento: l.vencimento,
    responsavel: l.responsavel,
    alunos: l.alunos,
    telefone: l.telefone,
    total: l.total,
    mensagem: l.mensagem,
  }));
}
