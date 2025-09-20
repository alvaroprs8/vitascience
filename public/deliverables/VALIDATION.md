# Validação e Testes

Este documento descreve como validar o clone do Eugene, o que analisar na saída e como medir qualidade.

## 1) Como executar
- UI: abra `/lead`, cole a Lead fornecida no teste, preencha opcionalmente `title` e `metadata`, envie.
- API: `POST /api/submit-lead` com body `{ vsl_copy, title?, metadata? }`.
- Poll: `GET /api/lead/status?id={correlationId}` até `status: 'ready'`.
- Callback: o n8n chama `POST /api/lead/callback` assinando com `X-Callback-Secret`.

## 2) Critérios de aceitação do OUTPUT (JSON)
O JSON final deve conter:
- `analise_nivel_consciencia`: nível 1–5, descrição/justificativa e adequação.
- `estrutura_copy`: `framework_usado` ∈ {AIDA, PAS, BAB, PASTOR, 4Ps} e análise resumida.
- `pontos_melhoria`: array com 5 itens (problema, explicacao, solucao, exemplo).
- `novos_angulos`: 3 ângulos (Solução, Problema, Produto), com Headline, Lead, Justificativa.
- `improvedLead`: lead reescrita pelo agente “Eugene”.
- `metadata` e `resumo_executivo` com timestamp/versão e síntese útil.

Formato estrito (sem linhas em branco) quando o prompt exigir; strings não vazias; campos obrigatórios presentes.

## 3) Testes funcionais
- Entrada mínima: apenas `vsl_copy` (sem título/metadados) → deve processar normalmente.
- Metadata inválida (UI): aviso de JSON inválido; envio bloqueado.
- Callback secret inválido: `401 Unauthorized` no endpoint de callback.
- CorrelationId ausente no callback: `400 Missing correlationId`.
- Tamanho de lead alto (ex.: > 10k chars): deve processar (latência maior é aceitável).

## 4) Testes do RAG
- Verifique que o índice Pinecone (`eugene-schwartz-index`) está populado e consultável.
- Faça uma pergunta simples que exija contexto do livro (via Q&A Chain) e inspecione se os “princípios” retornados fazem sentido e são extraídos do contexto.

## 5) Heurísticas de qualidade (score interno)
- Formato: 0–2 (0 = inválido; 1 = válido mas incompleto; 2 = válido e completo)
- Consciência: 0–2 (nível coerente, justificativa consistente com texto)
- Estrutura: 0–2 (framework plausível e análise menciona Hook/Big Idea/Mecanismo/Provas/Oferta/CTA)
- Melhorias: 0–2 (5 itens claros, com exemplo prático e aplicável)
- Ângulos: 0–2 (3 ângulos corretos por nível, headlines específicas)
- Lead reescrita: 0–2 (especificidade, mecanismo, momentum e grande ideia evidentes)

Soma máxima: 12. Aceitável ≥ 9.

## 6) Amostras
Cole aqui uma saída real (anonimizada) do seu teste com a VSL fornecida. Exemplo de shape esperado (campos ilustrativos):

```json
{
  "analise_nivel_consciencia": {
    "nivel_identificado": { "nivel": 3, "descricao": "Consciente da Solução" },
    "justificativa": "...",
    "adequacao": "Adequada"
  },
  "estrutura_copy": {
    "framework_usado": "AIDA",
    "elementos_identificados": ["Headline principal", "Lead de abertura", "Promessa central", "Prova social", "Call to action"],
    "analise_detalhada": "..."
  },
  "pontos_melhoria": [
    { "problema": "...", "explicacao": "...", "solucao": "...", "exemplo": "..." }
  ],
  "novos_angulos": [
    { "nivel_consciencia": "Consciente da Solução", "headline": "...", "lead": "...", "justificativa": "..." }
  ],
  "improvedLead": "...",
  "metadata": { "timestamp": "...", "modelo_usado": "...", "versao": "1.0.0" },
  "resumo_executivo": { "nota_geral": 9, "principal_problema": "...", "principal_oportunidade": "..." }
}
```

## 7) Observabilidade
- Logar latência total e por etapa no n8n (quando possível).
- Guardar `correlationId` + `received_at` para auditoria.

## 8) Limitações conhecidas
- Modelos especificados no JSON do workflow podem não existir em todas as contas → ajustar para GPT‑4o/4.1/Claude 3.5 Sonnet conforme disponibilidade.
- Dependência do PDF do livro para RAG: garantir autorização de uso e armazenamento.
