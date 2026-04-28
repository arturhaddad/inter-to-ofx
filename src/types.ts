export type Expense = {
  date: string;
  description: string;
  price: string;
  transactionType: 'CREDIT' | 'PAYMENT';
};

export type PdfMetadata = {
  dtStart: string;
  dtEnd: string;
  invoiceTotal: string;
  vencimentoDate: string;
};

export type ConvertedFile = {
  id: string;
  originalName: string;
  outputName: string;
  ofxContent: string;
  expenses: Expense[];
  metadata: PdfMetadata;
};

export type FailedFile = {
  id: string;
  originalName: string;
  error: string;
};

export type AppState =
  | { screen: 'upload' }
  | { screen: 'processing'; files: File[]; password: string; current: number; total: number }
  | { screen: 'results'; converted: ConvertedFile[]; failed: FailedFile[] };
