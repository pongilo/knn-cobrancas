import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';

interface DropzoneProps {
  nomeArquivo: string;
  onFileSelected: (file: File) => void;
  onLimpar: () => void;
}

export function Dropzone({ nomeArquivo, onFileSelected, onLimpar }: DropzoneProps) {
  const [arrastando, setArrastando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
    e.target.value = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setArrastando(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelected(file);
  };

  if (nomeArquivo) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
        <p className="m-0 text-base text-slate-600">
          Arquivo carregado: <strong className="text-slate-900">{nomeArquivo}</strong>
        </p>
        <button
          type="button"
          onClick={onLimpar}
          className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
        >
          Limpar
        </button>
      </div>
    );
  }

  return (
    <div
      className={
        'relative cursor-pointer rounded-xl border-2 border-dashed px-5 py-10 h-full flex-1 flex items-center justify-center text-center outline-none transition-colors ' +
        (arrastando
          ? 'border-blue-500 bg-blue-50'
          : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50 focus-visible:border-blue-400 focus-visible:bg-blue-50')
      }
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setArrastando(true);
      }}
      onDragLeave={() => setArrastando(false)}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleInputChange}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
      <p className="text-base text-slate-600">Arraste um arquivo .csv aqui ou clique para selecionar</p>
    </div>
  );
}
