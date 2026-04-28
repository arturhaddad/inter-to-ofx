import { zipSync, strToU8 } from 'fflate';

export function buildZipBlob(files: { name: string; content: string }[]): Blob {
  const entries: Record<string, Uint8Array> = {};
  for (const file of files) {
    entries[file.name] = strToU8(file.content);
  }
  const zipped = zipSync(entries);
  return new Blob([zipped.buffer as ArrayBuffer], { type: 'application/zip' });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadText(content: string, filename: string): void {
  downloadBlob(new Blob([content], { type: 'application/octet-stream' }), filename);
}
