import Papa from 'papaparse';

// Le um arquivo CSV (File do input/drag-and-drop) e devolve as linhas como objetos
// chaveados pelo cabecalho. O Papa Parse cuida de aspas/virgulas/quebras de linha
// dentro dos campos, deteccao automatica do delimitador (`,`, `;`, `\t`, ...) e do BOM.
export function lerCSV(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error instanceof Error ? error : new Error(String(error))),
    });
  });
}
