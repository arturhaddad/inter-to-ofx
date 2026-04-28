import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

type Props = {
  current: number;
  total: number;
  currentFileName?: string;
};

export default function ProcessingScreen({ current, total, currentFileName }: Props) {
  const progress = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <div>
            <p className="font-medium">Convertendo arquivos…</p>
            <p className="text-sm text-muted-foreground mt-1">
              {current} de {total}
              {currentFileName && (
                <span className="block truncate max-w-xs mx-auto mt-0.5 text-xs">
                  {currentFileName}
                </span>
              )}
            </p>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
}
