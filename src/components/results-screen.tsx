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
    <div className="min-h-screen flex flex-col items-center justify-start p-6 pt-10">
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
