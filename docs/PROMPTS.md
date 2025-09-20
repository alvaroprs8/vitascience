# Prompts e Mapeamentos

## Nível de Consciência
- Objetivo: classificar 1 de 5 níveis e justificar com 3–6 linhas; tag de adequação.
- Saída (sem markdown):
```
Nível: <Inconsciente|Consciente do Problema|Consciente da Solução|Consciente do Produto|Mais Consciente>
Justificativa: ...
Adequação: Adequada | Necessita ajustes
```

## Análise Estrutural (Framework)
- Identifica framework (AIDA, PAS, BAB, PASTOR, 4Ps) e comenta: Hook, Big Idea, Mecanismo, Provas, Oferta, CTA (5–8 linhas).
- Saída inicia com: `Framework: <SIGLA>`.

## 5 Pontos de Melhoria
- Formato obrigatório (sem rótulos e linhas em branco):
```
1. <problema>
<explicação>
<solução>
<exemplo>
2. ...
3. ...
4. ...
5. ...
```

## 3 Novos Ângulos
- Ordem: (1) Consciente da Solução; (2) Consciente do Problema; (3) Consciente do Produto
- Formato obrigatório (sem linhas em branco):
```
1.
Headline: ...
Lead: ...
Justificativa: ...
2.
Headline: ...
Lead: ...
Justificativa: ...
3.
Headline: ...
Lead: ...
Justificativa: ...
```

## Agente "Eugene Schwartz" (Reescrita da Lead)
- Instruções-chaves: Intensificação, Especificidade, Mecanismo Único, Momentum, Promessa Dominante.
- Estrutura da Lead com frases curtas, ritmo, transições e imagens vívidas.
- Entradas combinam as análises anteriores + RAG.
- Saída: apenas a lead final reescrita (texto puro).

## Mapeamento → JSON Final
- `analise_nivel_consciencia`: parser do texto (heurística por palavras-chave + fallback nível 3)
- `estrutura_copy`: `framework_usado` + `elementos_identificados` + `analise_detalhada`
- `pontos_melhoria`: `problema|explicacao|solucao|exemplo`
- `novos_angulos`: `nivel_consciencia|headline|lead|justificativa`
- `improvedLead`: lead reescrita pelo agente

## Observações
- RAG: index Pinecone `eugene-schwartz-index` (dim=1536); chunks 2000/overlap 300; namespace por projeto.
- Modelos: substitua por versões reais (ex.: gpt-4o-mini/4o, Claude 3.5 Sonnet) em produção.
