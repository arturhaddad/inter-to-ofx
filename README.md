# inter-to-ofx

Converta faturas de cartão de crédito do Banco Inter (PDF) para o formato OFX diretamente no navegador — sem servidor, sem uploads para terceiros.

## Como usar

1. Acesse a aplicação no navegador
2. Selecione um ou mais arquivos PDF de fatura do Inter (clique no botão ou arraste os arquivos para a página)
3. Se os PDFs forem protegidos por senha, informe a senha no campo indicado
4. Clique em **Continuar**
5. Aguarde a conversão
6. Na tela de resultados:
   - Clique em **Baixar** para salvar o OFX de um arquivo específico
   - Clique em **Baixar todos (.zip)** para baixar todos os OFX de uma vez
   - Expanda cada item para conferir os lançamentos extraídos antes de baixar

## Privacidade

Tudo acontece no seu navegador. Nenhum arquivo é enviado para qualquer servidor.

## Desenvolvimento local

Pré-requisitos: Node.js >= 20.19 e pnpm.

```bash
pnpm install
pnpm dev
```

Para build de produção:

```bash
pnpm build
pnpm preview
```

## Compatibilidade

Testado com faturas mensais do Banco Inter. O conversor identifica automaticamente as páginas de despesas e extrai os lançamentos com data, descrição e valor.

## Tecnologias

- [Vite](https://vitejs.dev) + [React](https://react.dev) + TypeScript
- [PDF.js](https://mozilla.github.io/pdf.js/) — leitura de PDFs no navegador
- [fflate](https://github.com/101arrowz/fflate) — geração de ZIP no navegador
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
