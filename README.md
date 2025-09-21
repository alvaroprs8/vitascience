# Vitascience – Sistema de Análise de Copy com Chat de Clones (múltiplos)

Este repositório contém um sistema completo para análise de leads de VSL e interação via chat com clones de especialistas (múltiplos personas), integrando Next.js, Supabase, n8n, Redis e Igniter.js.

## Sumário
- Visão Geral
- Arquitetura e Componentes
- Requisitos e Setup
- Variáveis de Ambiente
- Banco de Dados
- Funcionalidades
  - Chat com Clones (AI Chat multi-persona)
  - Análise de Lead da Copy (Workflow assíncrono)
  - Dashboard de Performance das Copys
- Seleção de Clones (como funciona)
- Rotas de API
- Operação e Observabilidade
- Segurança
- Roadmap de Melhorias

## Visão Geral
O sistema permite:
- Enviar uma lead de VSL para análise e melhoria (assíncrono via n8n).
- Conversar com diferentes clones (personas) sobre uma copy específica, com histórico persistido.
- Visualizar um dashboard das copys processadas e gerenciar o texto melhorado.

A decisão de qual clone/persona responder é feita no workflow do n8n com base nos metadados da copy e/ou regras do fluxo. O estado e resultados ficam no Supabase (PostgreSQL). Redis é utilizado para store/filas e o roteamento/datatypes são padronizados com Igniter.js.

## Arquitetura e Componentes
- App: Next.js 15 (App Router), React 19, Tailwind 4, Radix UI.
- API: Endpoints REST em `/api/*` para submit/callback/consulta.
- Orquestração: n8n via `N8N_WEBHOOK_URL` (análise) e `N8N_CHAT_WEBHOOK_URL` (chat, obrigatório).
- Banco: Supabase Postgres (tabelas `lead_results`, `chat_messages`).
- Cache/Filas: Redis + BullMQ (store e jobs utilitários).
- Roteador/Cliente: Igniter.js gera client tipado e expõe `/api/v1/*`.
- MCP (opcional): servidor MCP exposto em `/api/mcp/[transport]`.

## Requisitos e Setup
1) Node.js 20+, PNPM/npm.
2) Banco Postgres (Supabase) e Redis acessíveis por URL.
3) n8n com workflows configurados para receber webhooks e enviar callbacks.

Instalação:
```bash
npm install
```

Desenvolvimento:
```bash
npm run dev
```

Build/Produção:
```bash
npm run build
npm start
```

## Variáveis de Ambiente
Crie um arquivo `.env.local` com as chaves abaixo (exemplos):
```bash
# Supabase
SUPABASE_URL=...                   # URL do seu projeto
SUPABASE_SERVICE_ROLE_KEY=...      # Chave de service role (servidor)
NEXT_PUBLIC_SUPABASE_URL=...       # URL pública
NEXT_PUBLIC_SUPABASE_ANON_KEY=...  # Chave pública anon

# n8n (workflows)
N8N_WEBHOOK_URL=https://n8n.example.com/webhook/submit      # análise de lead
N8N_CHAT_WEBHOOK_URL=https://n8n.example.com/webhook/chat    # chat (obrigatório)
N8N_WEBHOOK_AUTH=Bearer xyz         # opcional
N8N_CALLBACK_SECRET=super-secret    # exige nos callbacks

# Igniter (client/router)
NEXT_PUBLIC_IGNITER_API_URL=http://localhost:3000
NEXT_PUBLIC_IGNITER_API_BASE_PATH=/api/v1

# Redis
REDIS_URL=redis://localhost:6379

# Telemetria (opcional)
IGNITER_TELEMETRY_ENABLE_EVENTS=false
IGNITER_TELEMETRY_ENABLE_METRICS=false
IGNITER_TELEMETRY_ENABLE_TRACING=false
IGNITER_TELEMETRY_ENABLE_CLI_INTEGRATION=false
```

Nunca commitar chaves sensíveis. Em produção, preferir secret managers.

## Banco de Dados
Tabelas básicas (ver `public/deliverables/*.sql`):
- `lead_results`:
  - `correlation_id` (PK), `status` (pending|ready|error), `improved_lead` (texto), `original_lead` (texto), `data` (jsonb), `received_at` (timestamptz)
- `chat_messages`:
  - `id` (uuid), `copy_id` (ref. a `lead_results.correlation_id`), `role` (user|assistant|system), `content` (texto), `message_correlation_id` (texto), `status`, `created_at`

Indices úteis já inclusos nos scripts em `public/deliverables`.

## Funcionalidades

### Chat com Clones (AI Chat multi-persona)
- Página: `/chat`
- Fluxo:
  1. Selecione uma copy (cada copy é um registro em `lead_results`).
  2. Envie mensagens; o sistema persiste a mensagem do usuário em `chat_messages`.
  3. O n8n recebe o evento e roteia para o clone adequado (conforme regras/metadata), retornando via callback; a resposta do assistente também é persistida.
- Histórico:
  - Carregado por `GET /api/chat/history?copyId=...`.
  - Envio via `POST /api/chat/send` com `{ copyId, message, context?, improvedLead?, history? }`.
- Importante: o endpoint de chat exige `N8N_CHAT_WEBHOOK_URL` configurado. Não há fallback para `N8N_WEBHOOK_URL`.

### Análise de Lead da Copy
- Endpoint principal: `POST /api/submit-lead`
- Entrada mínima: `{ lead }` (ou `vsl_copy`). Opcional: `title`, `metadata`.
- Comportamento:
  - Gera `correlationId`, salva `lead_results` com `status=pending` e `original_lead`.
  - Chama o webhook do n8n com `{ vsl_copy, correlationId, callbackUrl }`.
  - O n8n processa e chama `POST /api/lead/callback` com `{ correlationId, improvedLead, ... }`.
  - O sistema faz `upsert` e define `status=ready`.
- Consulta:
  - `GET /api/lead/status?correlationId=...`
  - `GET /api/lead/get?id=...` retorna detalhes (inclui `originalLead`/`improvedLead`).

### Dashboard de Performance das Copys
- Página: `/portfolio` (progresso e entregáveis).
- Listagem: `GET /api/lead/list?limit=50` retorna `status`, `receivedAt`, `title`, `hasImproved`.
- Edição do texto melhorado:
  - Dentro de `/chat`, ao selecionar uma copy, você pode salvar `improved_lead` via `POST /api/lead/update` com `{ id, improvedLead }`.

## Seleção de Clones (como funciona)
O sistema suporta múltiplos clones/personas. A escolha do clone é responsabilidade do workflow no n8n e normalmente segue uma das estratégias abaixo:
- Por metadata da copy: ao enviar a lead com `POST /api/submit-lead`, utilize o campo `metadata` para informar, por exemplo, `{ cloneId: "eugene" }`, `{ cloneId: "ogilvy" }`, `{ persona: "copy-chief" }`, etc. O n8n lê `lead_results.data.metadata` (via `copyId`) e decide qual clone usar.
- Por regras de conteúdo: o n8n inspeciona o texto (`original_lead` ou contexto do chat) e aplica heurísticas para seleção.

Exemplo de envio com `metadata`:
```bash
POST /api/submit-lead
{
  "lead": "... sua lead aqui ...",
  "title": "Lead VSL Produto X",
  "metadata": { "cloneId": "ogilvy", "campanha": "lancamento-q4" }
}
```

Observações:
- O frontend atual exibe o título do chat de forma genérica; a seleção real de clone ocorre no backend (n8n) com base nos metadados.
- Para chats, o `copyId` é suficiente para o n8n recuperar a `lead_results` e decidir o clone associado àquela copy.

## Rotas de API (Resumo)
- Leads
  - `POST /api/submit-lead` – inicia processamento no n8n, retorna `{ correlationId }`.
  - `POST /api/lead/callback` – callback autenticado via `X-Callback-Secret`.
  - `GET /api/lead/list?limit=...` – lista últimas copys processadas.
  - `GET /api/lead/get?id=...` – detalhes por `correlation_id`.
  - `GET /api/lead/status?correlationId=...` – status da análise.
  - `POST /api/lead/update` – atualiza `improved_lead`.
- Chat
  - `POST /api/chat/send` – envia mensagem do usuário e aciona n8n.
  - `POST /api/chat/callback` – persiste resposta do assistente (via n8n).
  - `GET /api/chat/history?copyId=...` – histórico por copy.
- Infra
  - `GET /api/ping` – healthcheck simples.
  - `ALL /api/v1/*` – roteador Igniter.js (ex.: `/api/v1/example/hello`).
  - `ALL /api/mcp/[transport]` – servidor MCP (opcional).

## Operação e Observabilidade
- Logs estruturados com `logger` e `telemetry` (Igniter.js). Inclua `correlationId`/`messageCorrelationId` nos logs.
- Configure timeouts/retries nas chamadas ao n8n (ver roadmap).
- Healthcheck: `/api/ping` e checagens de conectividade (Supabase/Redis/n8n).

## Segurança
- Não exponha `SUPABASE_SERVICE_ROLE_KEY` no cliente. Browser usa apenas `NEXT_PUBLIC_*`.
- Callbacks exigem `X-Callback-Secret` (`N8N_CALLBACK_SECRET`).
- Recomenda-se aplicar rate limiting nas rotas públicas (`/api/submit-lead`, `/api/chat/send`).

## Roadmap de Melhorias
- Banco: FK `chat_messages.copy_id -> lead_results.correlation_id` e UNIQUE em `chat_messages(message_correlation_id)` para idempotência.
- Resiliência: timeouts, retries exponenciais e circuit breaker nas integrações com n8n.
- Paginação: cursor em `lead/list` e `chat/history`.
- Observabilidade: traces por `correlationId`, métricas e painéis.
- Build: decidir por uso de Prisma (definir models) ou removê-lo.
- Rate limiting: por IP e por `copyId` com Redis.
- Multi-clone UI: selector opcional de clone no frontend (quando desejado), mantendo a decisão final no n8n.
