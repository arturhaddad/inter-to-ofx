import { Button } from '@/components/ui/button';
import { SuccessRow, ErrorRow } from '@/components/file-result-row';
import type { ConvertedFile, FailedFile } from '@/types';
import { buildZipBlob, downloadBlob } from '@/lib/zip';
import { Download, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

type Props = {
  converted: ConvertedFile[];
  failed: FailedFile[];
  onReset: () => void;
};

export default function ResultsScreen({ converted, failed, onReset }: Props) {
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
      </div>
    </div>
  );
}
