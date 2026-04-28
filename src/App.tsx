import { useEffect, useRef, useState } from 'react';
import UploadScreen from '@/components/upload-screen';
import ProcessingScreen from '@/components/processing-screen';
import ResultsScreen from '@/components/results-screen';
import { extractExpensesFromBuffer, buildOfx, getOutputFilename } from '@/lib/pdf-to-ofx';
import type { AppState, ConvertedFile, FailedFile } from '@/types';

export default function App() {
  const [state, setState] = useState<AppState>({ screen: 'upload' });
  const processingRef = useRef(false);

  useEffect(() => {
    if (state.screen !== 'processing' || processingRef.current) return;
    processingRef.current = true;

    const { files, password } = state;
    const converted: ConvertedFile[] = [];
    const failed: FailedFile[] = [];

    (async () => {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        setState(prev =>
          prev.screen === 'processing'
            ? { ...prev, current: i + 1 }
            : prev
        );

        try {
          const buffer = await file.arrayBuffer();
          const { lines, expenses, metadata } = await extractExpensesFromBuffer(buffer, password);

          if (lines.length === 0) {
            failed.push({
              id: crypto.randomUUID(),
              originalName: file.name,
              error: 'Nenhuma transação encontrada. Verifique se este é um PDF de fatura Inter válido.',
            });
            continue;
          }

          const outputName = getOutputFilename(file.name, metadata.vencimentoDate);
          const ofxContent = buildOfx(lines, metadata);

          converted.push({
            id: crypto.randomUUID(),
            originalName: file.name,
            outputName,
            ofxContent,
            expenses,
            metadata,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          const isPasswordError =
            message.toLowerCase().includes('password') ||
            message.toLowerCase().includes('encrypted');

          failed.push({
            id: crypto.randomUUID(),
            originalName: file.name,
            error: isPasswordError
              ? 'PDF protegido por senha. Verifique a senha informada.'
              : `Erro ao processar: ${message}`,
          });
        }
      }

      processingRef.current = false;
      setState({ screen: 'results', converted, failed });
    })();
  }, [state]);

  const handleContinue = (files: File[], password: string) => {
    setState({ screen: 'processing', files, password, current: 0, total: files.length });
  };

  const handleReset = () => {
    setState({ screen: 'upload' });
  };

  if (state.screen === 'upload') {
    return <UploadScreen onContinue={handleContinue} />;
  }

  if (state.screen === 'processing') {
    const currentFile = state.files[state.current - 1];
    return (
      <ProcessingScreen
        current={state.current}
        total={state.total}
        currentFileName={currentFile?.name}
      />
    );
  }

  return (
    <ResultsScreen
      converted={state.converted}
      failed={state.failed}
      onReset={handleReset}
    />
  );
}
