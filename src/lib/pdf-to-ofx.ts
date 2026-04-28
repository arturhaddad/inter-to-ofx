import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import type { Expense, PdfMetadata } from '@/types';

import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = workerUrl;

const MONTH_MAP: Record<string, string> = {
  jan: '01', fev: '02', mar: '03', abr: '04',
  mai: '05', jun: '06', jul: '07', ago: '08',
  set: '09', out: '10', nov: '11', dez: '12',
};

// Matches: "02 de mar. 2026  DESCRIPTION  -  [+] R$ 1.234,56"
const TX_LINE =
  /(\d{1,2})\s+de\s+(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\.\s+(\d{4})\s+(.+?)\s*-\s*(\+\s*)?R\$\s*([\d.]+,\d{2})/i;

interface PdfTextItem {
  str: string;
  transform: number[];
  width: number;
}

function isPdfTextItem(item: unknown): item is PdfTextItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'str' in item &&
    'transform' in item &&
    'width' in item
  );
}

/**
 * Groups pdfjs text items by their Y coordinate so each visual row
 * becomes a single string with columns joined left-to-right.
 * Uses item width to detect true word gaps vs. kerned glyph sequences.
 */
function groupItemsByLine(items: unknown[]): string[] {
  const lineMap = new Map<number, { x: number; width: number; text: string }[]>();

  for (const item of items) {
    if (!isPdfTextItem(item) || !item.str.trim()) continue;
    const y = Math.round(item.transform[5]);
    const x = item.transform[4];
    if (!lineMap.has(y)) lineMap.set(y, []);
    lineMap.get(y)!.push({ x, width: item.width, text: item.str });
  }

  return [...lineMap.keys()]
    .sort((a, b) => b - a)
    .map(y => {
      const row = lineMap.get(y)!.sort((a, b) => a.x - b.x);
      let line = '';
      for (let i = 0; i < row.length; i++) {
        if (i === 0) {
          line = row[i].text;
          continue;
        }
        const gap = row[i].x - (row[i - 1].x + row[i - 1].width);
        line += (gap > 1.5 ? ' ' : '') + row[i].text;
      }
      return line.replace(/(\S)\(/g, '$1 (').trim();
    });
}

export async function extractExpensesFromBuffer(
  buffer: ArrayBuffer,
  password: string,
): Promise<{ lines: string[]; expenses: Expense[]; metadata: PdfMetadata }> {
  const pdf = await getDocument({ data: new Uint8Array(buffer), password }).promise;

  const txLines: string[] = [];
  const expenses: Expense[] = [];
  const dateISOs: string[] = [];
  let invoiceTotal = '0.00';
  let vencimentoDate = '';

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const tc = await page.getTextContent();
    const pageLines = groupItemsByLine(tc.items);

    if (!pageLines.some(l => l.includes('Despesas da fatura'))) continue;

    if (!vencimentoDate || invoiceTotal === '0.00') {
      for (const l of pageLines) {
        const m = l.match(/(\d{2})\/(\d{2})\/(\d{4}).*R\$\s*([\d.]+,\d{2})\s*$/);
        if (m) {
          const [, dd, mm, yyyy, total] = m;
          if (!vencimentoDate) vencimentoDate = `${yyyy}-${mm}-${dd}`;
          if (invoiceTotal === '0.00') invoiceTotal = total.replace(/\./g, '').replace(',', '.');
          break;
        }
      }
    }

    for (const l of pageLines) {
      const m = l.match(TX_LINE);
      if (!m) continue;
      const [, dia, mes, ano, desc, sinal, valor] = m;
      const day = dia.padStart(2, '0');
      const credit = sinal ? '+ ' : '';
      const normalized = `${day} ${mes.toLowerCase()} ${ano} ${desc.trim()} - ${credit}R$ ${valor}`;
      txLines.push(normalized);

      const month = MONTH_MAP[mes.toLowerCase()];
      dateISOs.push(`${ano}${month}${day}`);

      expenses.push(parseExpense(normalized));
    }
  }

  const sorted = [...dateISOs].sort();
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const dtStart = sorted[0] ?? today;
  const dtEnd = sorted[sorted.length - 1] ?? today;

  return { lines: txLines, expenses, metadata: { dtStart, dtEnd, invoiceTotal, vencimentoDate } };
}

function parseExpense(input: string): Expense {
  const parts = input.split(' ');
  const day = parts[0].padStart(2, '0');
  const month = MONTH_MAP[parts[1].toLowerCase()];
  const year = parts[2];
  const priceIndex = parts.findIndex(p => p.startsWith('R$'));
  const description = parts.slice(3, priceIndex).join(' ');
  const isCredit = parts.includes('+');
  const pricePart = parts.slice(priceIndex).join(' ');
  const price = pricePart.replace(/[R$+]/g, '').trim().replace(/\./g, '').replace(',', '.');

  return {
    date: `${year}${month}${day}`,
    description,
    price,
    transactionType: isCredit ? 'CREDIT' : 'PAYMENT',
  };
}

export function buildOfx(lines: string[], metadata: PdfMetadata): string {
  let uniqueID = 0;

  const dtServer = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  function formatExpense(input: string): string {
    const { date, description, price, transactionType } = parseExpense(input);
    const fitID = `${date}${(++uniqueID).toString().padStart(4, '0')}`;

    return `<STMTTRN>
<TRNTYPE>${transactionType}</TRNTYPE>
<DTPOSTED>${date}</DTPOSTED>
<TRNAMT>${transactionType === 'CREDIT' ? '' : '-'}${price}</TRNAMT>
<FITID>${fitID}</FITID>
<CHECKNUM>077</CHECKNUM>
<REFNUM>077</REFNUM>
<MEMO>${description}</MEMO>
</STMTTRN>`;
  }

  const header = `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
<SIGNONMSGSRSV1>
<SONRS>
<STATUS>
<CODE>0</CODE>
<SEVERITY>INFO</SEVERITY>
</STATUS>
<DTSERVER>${dtServer}</DTSERVER>
<LANGUAGE>POR</LANGUAGE>
<FI>
<ORG>Banco Intermedium S/A</ORG>
<FID>077</FID>
</FI>
</SONRS>
</SIGNONMSGSRSV1>
<BANKMSGSRSV1>
<STMTTRNRS>
<TRNUID>1001</TRNUID>
<STATUS>
<CODE>0</CODE>
<SEVERITY>INFO</SEVERITY>
</STATUS>
<STMTRS>
<CURDEF>BRL</CURDEF>
<BANKACCTFROM>
<BANKID>077</BANKID>
<ACCTTYPE>CHECKING</ACCTTYPE>
</BANKACCTFROM>
<BANKTRANLIST>
<DTSTART>${metadata.dtStart}</DTSTART>
<DTEND>${metadata.dtEnd}</DTEND>
`;

  const footer = `
</BANKTRANLIST>
<LEDGERBAL>
<BALAMT>${metadata.invoiceTotal}</BALAMT>
<DTASOF>${dtServer}</DTASOF>
</LEDGERBAL>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;

  const transactions = lines
    .filter(l => l.trim().length > 0)
    .map(formatExpense)
    .join('\n');

  return `${header}${transactions}${footer}`;
}

export function getOutputFilename(originalName: string, vencimentoDate: string): string {
  if (vencimentoDate) {
    return `Inter_${vencimentoDate}.ofx`;
  }
  return originalName.replace(/\.pdf$/i, '.ofx');
}
