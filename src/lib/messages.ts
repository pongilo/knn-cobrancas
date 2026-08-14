const tresDiasAntes = `Olá! Tudo bem? Aqui é a *KNN Idiomas*. Passando para lembrar que há um pagamento com *vencimento em 3 dias* ({{venc}}).

*Valor:* {{valorBloco}}

Chave Pix: 31.847.175/0001-62
Para: Escolas Pongilo Ltda
Instituição: Stone IP S.A

Caso o pagamento já tenha sido efetuado, desconsidere esta mensagem.
Obrigado! 😊`;

const hoje = `Olá! Tudo bem? Aqui é a *KNN Idiomas*. Hoje é a data de vencimento do pagamento.

*Valor:* {{valorBloco}}

Chave Pix: 31.847.175/0001-62
Para: Escolas Pongilo Ltda
Instituição: Stone IP S.A

Caso o pagamento já tenha sido efetuado, desconsidere esta mensagem.
Obrigado! 😊`;

const carencia = `Olá! Tudo bem? Aqui é a *KNN Idiomas*. Verificamos que o pagamento com vencimento em {{venc}} ainda consta em aberto.

*Valor:* {{valorBloco}}

Chave Pix: 31.847.175/0001-62
Para: Escolas Pongilo Ltda
Instituição: Stone IP S.A

Caso o pagamento já tenha sido efetuado, desconsidere esta mensagem.
Obrigado! 😊`;

const atraso = `Olá! Tudo bem? Aqui é a *KNN Idiomas*. Identificamos que há pagamento(s) em atraso. Para evitar encargos e manter sua situação regularizada, efetue o pagamento o quanto antes.

*Valor(es) em aberto:* {{valorBloco}}

Chave Pix: 31.847.175/0001-62
Para: Escolas Pongilo Ltda
Instituição: Stone IP S.A

Caso o pagamento já tenha sido efetuado, desconsidere esta mensagem.
Obrigado! 😊`;

const muitoAtraso = `Olá! Tudo bem? Aqui é a *KNN Idiomas*. Identificamos que há pagamento(s) com mais de 15 dias de atraso. Pedimos que regularize a situação o quanto antes ou entre em contato conosco para negociarmos uma solução.

*Valor(es) em aberto:* {{valorBloco}}

Chave Pix: 31.847.175/0001-62
Para: Escolas Pongilo Ltda
Instituição: Stone IP S.A

Caso o pagamento já tenha sido efetuado, desconsidere esta mensagem.
Obrigado! 😊`;

// Data invalida: mensagem generica de seguranca
const invalida = `Olá! Tudo bem? Aqui é a *KNN Idiomas*. Identificamos uma pendência em seu cadastro.

*Valor:* {{valorBloco}}

Chave Pix: 31.847.175/0001-62
Para: Escolas Pongilo Ltda
Instituição: Stone IP S.A

Caso o pagamento já tenha sido efetuado, desconsidere esta mensagem.
Obrigado! 😊`;

const TEMPLATES = {
  tresDiasAntes,
  hoje,
  carencia,
  atraso,
  muitoAtraso,
  invalida,
};

export type TipoMensagem = keyof typeof TEMPLATES;

export function montarMensagem(tipo: TipoMensagem, venc: string, valorBloco: string): string {
  const template = TEMPLATES[tipo];
  const data: Record<string, string | number> = { venc, valorBloco };

  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return key in data ? String(data[key]) : match;
  });
}
