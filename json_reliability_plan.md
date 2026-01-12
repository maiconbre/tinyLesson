# Estratégia de Robustez para JSON (Zero Erros)

Para eliminar o erro "Formato de resposta inválido", precisamos atuar nas duas pontas: **n8n** (garantir que sai limpo) e **Next.js** (ser tolerante se chegar sujo).

## 1. Solução no n8n (A Defesa Principal)

O maior problema é que LLMs às vezes respondem com texto extra ("Aqui está o seu JSON:") ou blocos Markdown de código, o que quebra o parser simples.

### Adicionar um "Code Node" Sanitizador
Logo após o nó "AI Agent" e antes do "Respond to Webhook", adicione um nó do tipo **Code** (JavaScript).

**Código para o nó:**
```javascript
// Obtém o texto gerado pelo agente
const text = $input.item.json.output || $input.item.json.text || "";

function extractJSON(str) {
  // 1. Tenta parsear direto
  try { return JSON.parse(str); } catch (e) {}

  // 2. Remove blocos de markdown ```json ... ```
  const jsonMatch = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[1]); } catch (e) {}
  }

  // 3. Busca o primeiro '{' e o último '}'
  const firstOpen = str.indexOf('{');
  const lastClose = str.lastIndexOf('}');
  if (firstOpen !== -1 && lastClose !== -1) {
    const candidate = str.substring(firstOpen, lastClose + 1);
    try { return JSON.parse(candidate); } catch (e) {}
  }

  throw new Error("Não foi possível extrair JSON válido da resposta da IA.");
}

const cleanData = extractJSON(text);

// Retorna o objeto limpo para o webhook response
return { json: { output: cleanData } };
```

## 2. Solução no Next.js (A Rede de Segurança)

Vamos tornar a função `validateResponse` em `src/app/api/mini-course/route.ts` "à prova de falhas". Em vez de lançar erro se faltar um campo opcional, ela deve preencher com padrão.

### Mudanças Propostas:
1.  **Parser Resiliente:** Usar a biblioteca `dirty-json` ou lógica similar (já temos uma boa, mas vamos refinar).
2.  **Schema Leniency:**
    *   Se `glossary` faltar -> assume `[]`.
    *   Se `study_tips` faltar -> assume `[]`.
    *   Se `quiz` faltar em um módulo -> assume `[]`.
    *   Se `answer` do quiz não for A/B/C/D -> Tenta corrigir ou assume "A".

## 3. Melhoria no Prompt (Prevenção)

Adicionar ao System Prompt:
> "IMPORTANTE: Retorne APENAS o JSON cru. NÃO use blocos de código markdown (```json). NÃO escreva introduções."

---

### Plano de Execução
1.  Atualizar o arquivo `n8n_agent_setup.md` com o código do nó sanitizador.
2.  Refatorar `src/app/api/mini-course/route.ts` para aplicar "Soft Validation" (preencher falhas em vez de quebrar).
