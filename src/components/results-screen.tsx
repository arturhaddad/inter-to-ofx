import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SuccessRow, ErrorRow } from '@/components/file-result-row';
import type { ConvertedFile, FailedFile } from '@/types';
import { buildZipBlob, downloadBlob } from '@/lib/zip';
import { Download, ArrowLeft, CheckCircle, XCircle, Check } from 'lucide-react';

type Props = {
  converted: ConvertedFile[];
  failed: FailedFile[];
  onReset: () => void;
};

export default function ResultsScreen({ converted, failed, onReset }: Props) {
  const [copied, setCopied] = useState(false);

  const copyPix = () => {
    navigator.clipboard.writeText('67057e4c-8573-4523-9d2d-43b4c8461f81');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    if (converted.length === 0) return;
    const files = converted.map(f => ({ name: f.outputName, content: f.ofxContent }));
    const zip = buildZipBlob(files);
    downloadBlob(zip, 'inter-ofx.zip');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 pt-10 relative">
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

      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Conversão concluída</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              {converted.length > 0 && (
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  {converted.length} convertido{converted.length !== 1 ? 's' : ''}
                </span>
              )}
              {failed.length > 0 && (
                <span className="flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-destructive" />
                  {failed.length} com erro
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {converted.length > 1 && (
              <Button
                variant="default"
                size="sm"
                className="gap-1.5"
                onClick={handleDownloadAll}
              >
                <Download className="w-4 h-4" />
                Baixar todos (.zip)
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={onReset}
            >
              <ArrowLeft className="w-4 h-4" />
              Nova conversão
            </Button>
          </div>
        </div>

        {/* Converted files */}
        {converted.length > 0 && (
          <div className="space-y-2">
            {converted.map(file => (
              <SuccessRow key={file.id} file={file} />
            ))}
          </div>
        )}

        {/* Failed files */}
        {failed.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Erros
            </p>
            {failed.map(file => (
              <ErrorRow key={file.id} file={file} />
            ))}
          </div>
        )}

        {/* Buy me a coffee */}
        <Tooltip>
          <TooltipTrigger
            onClick={copyPix}
            className="w-full flex flex-col items-center gap-3 rounded-2xl border border-border bg-muted/30 px-5 py-5 cursor-pointer hover:bg-accent/50 transition-colors"
          >
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">Esse app te ajudou?</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {copied ? 'Chave Pix copiada! Obrigado ❤️' : 'Me pague um cafézinho ☕'}
              </p>
            </div>
            <div className="relative">
              <img
                src="/qr-code.png"
                alt="QR Code Pix"
                className="size-32 rounded-md"
              />
              {copied && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-md bg-background/90 backdrop-blur-sm">
                  <Check className="w-7 h-7 text-green-500" />
                  <span className="text-xs font-medium text-green-600">Copiado!</span>
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copiar chave Pix</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
