export function Alerta({ mensagem }: { mensagem: string }) {
  return <div className="alert alert--error">{mensagem}</div>;
}
