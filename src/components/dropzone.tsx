import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';

interface DropzoneProps {
  nomeArquivo: string;
  onFileSelected: (file: File) => void;
}

export function Dropzone({ nomeArquivo, onFileSelected }: DropzoneProps) {
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

  return (
    <div
      className={'dropzone' + (arrastando ? ' dropzone--active' : '')}
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
        className="dropzone__input"
      />
      <p className="dropzone__text">
        {nomeArquivo ? (
          <>
            Arquivo carregado: <strong>{nomeArquivo}</strong>
          </>
        ) : (
          <>Arraste um arquivo .csv aqui ou clique para selecionar</>
        )}
      </p>
    </div>
  );
}
