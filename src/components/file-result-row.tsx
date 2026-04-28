import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronDown, ChevronRight, Download, AlertCircle, CheckCircle } from 'lucide-react';
import type { ConvertedFile, FailedFile } from '@/types';
import { downloadText } from '@/lib/zip';
import { cn } from '@/lib/utils';

type SuccessRowProps = {
  file: ConvertedFile;
};

function formatAmount(price: string, type: 'CREDIT' | 'PAYMENT') {
  const num = parseFloat(price);
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num);
  return type === 'PAYMENT' ? `-${formatted}` : formatted;
}

function formatDate(dateStr: string) {
  if (dateStr.length !== 8) return dateStr;
  return `${dateStr.slice(6, 8)}/${dateStr.slice(4, 6)}/${dateStr.slice(0, 4)}`;
}

export function SuccessRow({ file }: SuccessRowProps) {
  const [open, setOpen] = useState(false);
  const handleOpenChange = (value: boolean) => setOpen(value);

  return (
    <Collapsible open={open} onOpenChange={handleOpenChange}>
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />

          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{file.outputName}</p>
            <p className="text-xs text-muted-foreground truncate">de: {file.originalName}</p>
          </div>

          <Badge variant="secondary" className="shrink-0 tabular-nums">
            {file.expenses.length} lançamento{file.expenses.length !== 1 ? 's' : ''}
          </Badge>

          <Button
            variant="outline"
            size="sm"
            className="shrink-0 h-8 gap-1.5"
            onClick={() => downloadText(file.ofxContent, file.outputName)}
          >
            <Download className="w-3.5 h-3.5" />
            Baixar
          </Button>

          <CollapsibleTrigger className="inline-flex items-center justify-center shrink-0 h-8 w-8 rounded-md cursor-pointer hover:bg-accent transition-colors">
            {open
              ? <ChevronDown className="w-4 h-4" />
              : <ChevronRight className="w-4 h-4" />
            }
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="border-t px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Lançamentos extraídos
              </p>
              {file.metadata.vencimentoDate && (
                <p className="text-xs text-muted-foreground">
                  Vencimento: {file.metadata.vencimentoDate.split('-').reverse().join('/')}
                </p>
              )}
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-24">Data</TableHead>
                    <TableHead className="text-xs">Descrição</TableHead>
                    <TableHead className="text-xs text-right w-32">Valor</TableHead>
                    <TableHead className="text-xs w-24">Tipo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {file.expenses.map((expense, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs tabular-nums">{formatDate(expense.date)}</TableCell>
                      <TableCell className="text-xs max-w-xs truncate">{expense.description}</TableCell>
                      <TableCell className={cn(
                        'text-xs text-right tabular-nums font-mono',
                        expense.transactionType === 'CREDIT' ? 'text-green-600 dark:text-green-400' : ''
                      )}>
                        {formatAmount(expense.price, expense.transactionType)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={expense.transactionType === 'CREDIT' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {expense.transactionType === 'CREDIT' ? 'Crédito' : 'Débito'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <span>Total fatura:</span>
              <span className="font-mono font-medium">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                  .format(parseFloat(file.metadata.invoiceTotal))}
              </span>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

type ErrorRowProps = {
  file: FailedFile;
};

export function ErrorRow({ file }: ErrorRowProps) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-start gap-3">
      <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{file.originalName}</p>
        <p className="text-xs text-destructive/80 mt-0.5">{file.error}</p>
      </div>
    </div>
  );
}
