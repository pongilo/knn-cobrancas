export function Alerta({ mensagem }: { mensagem: string }) {
  return (
    <div className="rounded-lg border border-red-300/50 bg-red-50 px-4 py-3 text-[15px] text-red-600">{mensagem}</div>
  );
}
