# Concepção da Solução — Clone Eugene Schwartz

## Objetivo
Construir um sistema que receba a Lead de VSL, analise via metodologia de Eugene Schwartz (níveis de consciência, framework, melhorias, ângulos) e retorne um JSON estruturado + lead reescrita. Tudo orquestrado por n8n, com RAG sobre o livro Breakthrough Advertising.

## Arquitetura (alto nível)
```mermaid
flowchart LR
  A[Cliente /lead] -->|POST /api/submit-lead| B[Next.js API]
  B -->|POST vsl_copy + correlationId + callbackUrl| C[n8n Webhook]
  C --> D[Extrair/Validar Input]
  D --> E[Análise Nível de Consciência]
  D --> F[Análise Estrutural]
  D --> G[Q&A RAG (Pinecone)]
  E --> H[Gerar 5 Melhorias]
  F --> H
  E --> I[Criar 3 Ângulos]
  D --> I
  G --> J[Agente Eugene Reescrever Lead]
  H --> J
  I --> J
  J --> K[Formatar JSON Final]
  K --> L[Callback HTTP]
  L -->|POST /api/lead/callback| M[Next.js API]
  M --> N[(Supabase lead_results)]
  A <-->|GET /api/lead/status|get|list| M
```

## Decisões e Trade-offs
- n8n para orquestração por ser visual, auditar execuções e acoplar nós LangChain facilmente.
- RAG com Pinecone (dim=1536) e `text-embedding-3-large` pela qualidade; opção de custo: `text-embedding-3-small`.
- Async via `correlationId` para UX responsiva; callback assinado (`X-Callback-Secret`).
- Supabase para persistir resultados e histórico (consulta posterior e reprodutibilidade).

## Fluxo Resumido
1. Cliente envia `vsl_copy`, `title` e `metadata`.
2. API chama n8n com `correlationId` e `callbackUrl`.
3. n8n valida, consulta RAG, executa análises e agente de reescrita.
4. n8n formata JSON e faz callback.
5. API salva no Supabase; UI exibe via polling/listagem.

## Riscos
- Key de LLM/embedding; custos de vetorização; controle de versões do índice.
- Inputs fora do formato; JSON inconsistente (mitigado por parser no `Formatar Resposta JSON Final`).

## Evolução
- Agentes por área (marketing, vendas, suporte) aproveitando a mesma base RAG.
- Métricas de avaliação (heurísticas de consistência + amostra humana).
