import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, FileText, Lock } from 'lucide-react';

type Props = {
  onContinue: (files: File[], password: string) => void;
};

export default function UploadScreen({ onContinue }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((incoming: File[]) => {
    const pdfs = incoming.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (pdfs.length === 0) return;
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name + f.size));
      const unique = pdfs.filter(f => !existing.has(f.name + f.size));
      return [...prev, ...unique];
    });
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    addFiles(dropped);
  }, [addFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  return (
    <div
      className="flex flex-col justify-center items-center p-6 min-h-screen transition-colors duration-200"
      style={{ backgroundColor: isDragging ? 'hsl(var(--accent) / 0.06)' : undefined }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="fixed inset-0 z-50 m-3 rounded-lg border-4 border-dashed transition-all pointer-events-none border-primary/50" />
      )}

      <div className="space-y-8 w-full max-w-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Inter → OFX</h1>
          <p className="text-sm text-muted-foreground">
            Converta faturas de cartão de crédito do Banco Inter para o formato OFX diretamente no navegador.
          </p>
        </div>

        {/* Drop zone */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col gap-3 items-center p-10 w-full rounded-xl border-2 border-dashed transition-all cursor-pointer border-border hover:border-primary/50 hover:bg-accent/30 group"
        >
          <div className="p-3 rounded-full transition-colors bg-primary/10 group-hover:bg-primary/15">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Clique para selecionar PDFs</p>
            <p className="mt-1 text-xs text-muted-foreground">ou arraste e solte aqui (ou em qualquer lugar da página)</p>
          </div>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
              {files.length} arquivo{files.length !== 1 ? 's' : ''} selecionado{files.length !== 1 ? 's' : ''}
            </p>
            <ul className="space-y-1.5">
              {files.map((file, i) => (
                <li
                  key={file.name + file.size}
                  className="flex gap-2 items-center px-3 py-2 text-sm rounded-lg bg-muted/50"
                >
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="flex-1 truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="rounded p-0.5 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                    aria-label={`Remover ${file.name}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Password */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-sm font-medium" htmlFor="pdf-password">
            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
            Senha dos PDFs
            <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
          </label>
          <Input
            id="pdf-password"
            type="password"
            placeholder="Deixe em branco se não houver senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="off"
          />
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={files.length === 0}
          onClick={() => onContinue(files, password)}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
