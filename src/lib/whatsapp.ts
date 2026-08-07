import { createServerFn } from '@tanstack/react-start';

export interface ItemEnvio {
  index: number;
  telefone: string;
  mensagem: string;
}

export interface ResultadoEnvio {
  index: number;
  ok: boolean;
  id?: string;
  status?: string;
  error?: string;
  code?: string;
}

interface AraraError extends Error {
  code?: string;
  status?: number;
}

const ARARA_BASE_URL = 'https://api.ararahq.com';
const LIMITE_POR_ENVIO = 200;

// Normaliza telefones brasileiros para E.164 (+55DDNNNNNNNNN).
function toE164BR(raw: string): string | null {
  let d = raw.replace(/\D/g, '');
  if (!d) return null;

  if (!d.startsWith('55')) {
    if (d.length === 10 || d.length === 11) {
      d = '55' + d;
    } else {
      return null;
    }
  }

  if (d.length !== 12 && d.length !== 13) return null;
  return '+' + d;
}

// Envia uma mensagem de texto livre via Arara (POST /v1/messages).
// Respeita 429 honrando o header Retry-After com uma unica nova tentativa.
async function enviarMensagemArara(
  { receiver, body, apiKey }: { receiver: string; body: string; apiKey: string },
  tentativa = 0,
): Promise<{ id: string; status: string }> {
  const res = await fetch(`${ARARA_BASE_URL}/v1/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ receiver, type: 'text', body }),
  });

  if (res.status === 429 && tentativa === 0) {
    const retryAfter = Number(res.headers.get('retry-after')) || 1;
    await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
    return enviarMensagemArara({ receiver, body, apiKey }, tentativa + 1);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.error?.message || data?.message || `Erro HTTP ${res.status}`;
    const error = new Error(message) as AraraError;
    error.code = data?.error?.code || String(res.status);
    error.status = res.status;
    throw error;
  }

  return data;
}

export const enviarWhatsapp = createServerFn({ method: 'POST' })
  .validator((data: { items: ItemEnvio[] }) => data)
  .handler(async ({ data }): Promise<ResultadoEnvio[]> => {
    const apiKey = process.env.ARARA_API_KEY;
    if (!apiKey) {
      throw new Error('ARARA_API_KEY não configurada no servidor (arquivo .env).');
    }

    const items = data.items;
    if (items.length === 0) {
      throw new Error('Nenhum item para enviar.');
    }
    if (items.length > LIMITE_POR_ENVIO) {
      throw new Error(`Envie no máximo ${LIMITE_POR_ENVIO} mensagens por vez.`);
    }

    const resultados: ResultadoEnvio[] = [];
    for (const item of items) {
      const numero = toE164BR(item.telefone);

      if (!numero) {
        resultados.push({ index: item.index, ok: false, error: `Telefone inválido: "${item.telefone}"` });
        continue;
      }
      if (!item.mensagem.trim()) {
        resultados.push({ index: item.index, ok: false, error: 'Mensagem vazia.' });
        continue;
      }

      try {
        const resp = await enviarMensagemArara({
          receiver: `whatsapp:${numero}`,
          body: item.mensagem,
          apiKey,
        });
        resultados.push({ index: item.index, ok: true, id: resp.id, status: resp.status });
      } catch (e) {
        const err = e as AraraError;
        resultados.push({ index: item.index, ok: false, error: err.message, code: err.code });
      }
    }

    return resultados;
  });
