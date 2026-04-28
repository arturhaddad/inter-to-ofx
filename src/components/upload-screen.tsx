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
      className="flex flex-col justify-center items-center p-6 min-h-screen transition-colors duration-200 relative"
      style={{ backgroundColor: isDragging ? 'hsl(var(--accent) / 0.06)' : undefined }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <a
        href="https://github.com/arturhaddad/inter-to-ofx"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Ver código no GitHub"
        className="absolute top-4 right-4 p-2 rounded-md text-foreground hover:bg-accent transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      </a>

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
            <p className="mt-1 text-xs text-muted-foreground">ou arraste e solte aqui</p>
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

        <div className="space-y-3">
          <Button
            className="w-full"
            size="lg"
            disabled={files.length === 0}
            onClick={() => onContinue(files, password)}
          >
            Continuar
          </Button>

          <p className="flex gap-1.5 justify-center items-center text-xs text-muted-foreground">
            <Lock className="w-3 h-3 shrink-0" />
            Processamento 100% local no navegador. Nenhum arquivo sai do seu dispositivo.
          </p>
        </div>
      </div>
    </div>
  );
}
