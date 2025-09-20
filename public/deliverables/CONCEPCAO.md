# Concepção da Solução

## Contexto
Criar um "clone digital do Eugene Schwartz" que receba a Lead de uma VSL, analise usando os princípios do livro Breakthrough Advertising (com ênfase nos 5 níveis de consciência), proponha melhorias, gere novos ângulos e retorne um JSON estruturado. O fluxo principal roda no n8n.

## Arquitetura (alto nível)
- Front-end e API: Next.js (rota `/lead` para envio da lead e visualização do resultado; APIs `/api/submit-lead`, `/api/lead/status`, `/api/lead/callback`).
- Orquestração: n8n (workflow com etapas de análise, geração e formatação do JSON final).
- RAG: Pinecone como vector store; embeddings OpenAI (`text-embedding-3-large`); conteúdo: livro “Breakthrough Advertising”.
- LLMs: OpenAI/Anthropic para análises e reescrita (pode-se usar GPT‑4o/GPT‑4.1/Claude 3.5 Sonnet). No JSON do workflow há modelos ilustrativos; em produção, configure os disponíveis.
- Persistência do resultado: Supabase (tabela `lead_results`).

## Fluxo End‑to‑End
1) Usuário cola a Lead na página `/lead`.
2) A página chama `POST /api/submit-lead`, que gera `correlationId` e envia ao n8n o payload `{ vsl_copy, title, metadata, correlationId, callbackUrl }`.
3) n8n processa: análises (nível de consciência, framework, melhorias, ângulos), RAG (princípios do Eugene) e agente "Eugene" para reescrever a lead.
4) n8n compila o JSON final e faz `POST { callbackUrl }` com `X-Callback-Secret`.
5) O callback salva no Supabase (`lead_results`) e o front passa a exibir o resultado (poll via `GET /api/lead/status?id=`).

Veja o diagrama em `public/deliverables/DIAGRAMA.mmd` e a página `/deliverables`.

## Componentes do Workflow n8n (resumo)
- Download do PDF (Google Drive) → Split (2000/300) → Embeddings (OpenAI) → Pinecone (insert)
- Webhook `analyze-vsl-copy` → validação do input → análises (LLMs)
- Retrieval QA em Pinecone para extrair princípios do Eugene
- Agente "Eugene Schwartz" usando contexto das análises e RAG para reescrever a lead
- Formatação final em JSON → HTTP Request (callback)

## Segurança
- Callback assinado: header `X-Callback-Secret` validado por `POST /api/lead/callback`.
- Idempotência: upsert por `correlation_id`.
- Sanitização básica: validação de input no n8n (nó de código) e no backend.

## Decisões e Trade-offs
- n8n para orquestração rápida, debug visual e reuso em outras equipes.
- RAG com Pinecone para grounding no livro (evitar alucinações e garantir aderência à metodologia).
- Formato JSON estrito para integração simples com front/BI.
- Custo/latência dos LLMs: prompts compactos, chunks otimizados e uso de modelos rápidos onde possível.

## Variáveis de Ambiente (app)
- `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_AUTH` (opcional), `N8N_CALLBACK_SECRET`
- `NEXT_PUBLIC_IGNITER_API_URL`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

## Checklist de Implantação
1) Subir app (Vercel) e setar variáveis.
2) Criar tabela `lead_results` (ver `public/deliverables/DB_SCHEMA.sql`).
3) Indexar o PDF do Eugene no n8n (Google Drive → Pinecone).
4) Importar workflow do n8n (ver `public/deliverables/n8n-workflow.json`) e ajustar credenciais/índice.
5) Testar via UI `/lead` e via API.

## Melhorias Futuras
- Modo síncrono opcional (respostas curtas).
- Versões dos prompts e auditoria.
- Métricas de qualidade automáticas (detector de formato/score de aderência).
- Multi‑modelo com fallback e seleção dinâmica por tamanho do input.
