# Guia de Configuração do Agente n8n para TinyLesson

Este guia descreve passo a passo como configurar o workflow no n8n para receber requisições do gerador de cursos (TinyLesson) e retornar os dados no formato exato que a aplicação espera.

## 1. Visão Geral do Fluxo

A aplicação envia um POST para o webhook com um tema. O n8n deve processar este tema usando uma IA e retornar um JSON estritamente formatado com o conteúdo do curso, módulos, lições e quiz.

- **Entrada (Webhook):** `{ "theme": "Tópico do Curso" }`
- **Saída (Webhook Response):** JSON estruturado (detalhado abaixo).

---

## 2. Passo a Passo no n8n

### Nó 1: Webhook
- **Method:** `POST`
- **Path:** `/webhook/...` (O UUID deve bater com o configurado na env da aplicação).
- **Authentication:** None (ou conforme sua config de segurança).
- **Respond:** `Using 'Respond to Webhook' Node`.

### Nó 2: AI Agent / LLM Chain
Você deve usar um nó de IA (ex: Basic LLM Chain ou AI Agent) conectado a um modelo capaz (Recomendado: **GPT-4o** ou **Claude 3.5 Sonnet** para garantir a estrutura JSON complexa).

#### Configuração do Prompt (System Message)
O prompt é a parte mais crítica. A aplicação valida rigidamente a estrutura. Copie e cole o prompt abaixo na "System Message" ou "Instruction" do seu agente.

> **Importante:** Se estiver usando o nó "AI Agent", certifique-se de configurar o **Output Parser** para JSON ou instruir explicitamente o modelo para retornar *apenas* o JSON cru, sem markdown (```json ... ```), embora a aplicação tente limpar blocos de código se eles existirem.

---

### PROMPT DO AGENTE (Copie isto)

```text
Você é um especialista pedagógico e criador de cursos online. Sua tarefa é criar um mini-curso completo e detalhado sobre o tema fornecido pelo usuário.

REGRA CRÍTICA: Sua resposta deve ser ESTRITAMENTE um objeto JSON válido. Não inclua texto introdutório, não use markdown (```json), apenas retorne o JSON cru.

O formato do JSON deve seguir EXATAMENTE esta estrutura:

{
  "title": "Título Criativo do Curso",
  "objectives": [
    "Objetivo de aprendizado 1",
    "Objetivo 2",
    "Objetivo 3"
  ],
  "modules": [
    {
      "module_title": "Título do Módulo 1",
      "introduction": "Breve introdução do módulo.",
      "lessons": [
        {
          "lesson_title": "Título da Lição",
          "content": "Conteúdo detalhado e educativo da lição. Use parágrafos claros.",
          "example": "Um exemplo prático ou estudo de caso relacionado."
        },
        {
          "lesson_title": "Título da Lição 2",
          "content": "Conteúdo...",
          "example": "Exemplo..."
        }
      ],
      "quiz": [
        {
          "question": "Pergunta sobre o conteúdo do módulo?",
          "options": [
            "A) Opção incorreta",
            "B) Opção correta",
            "C) Opção incorreta",
            "D) Opção incorreta"
          ],
          "answer": "B",
          "explanation": "Explicação do porquê a resposta B está correta."
        }
      ]
    }
  ],
  "glossary": [
    {
      "term": "Termo Técnico 1",
      "definition": "Definição clara do termo."
    }
  ],
  "study_tips": [
    "Dica de estudo 1",
    "Dica 2"
  ],
  "final_summary": "Resumo encorajador e conclusão do curso."
}

REQUISITOS DE CONTEÚDO:
1. Crie pelo menos 5 módulos.
2. Cada módulo deve ter pelo menos 2 lições.
3. Cada módulo deve ter pelo menos 2 perguntas de quiz.
4. As opções do quiz devem SEMPRE começar com "A)", "B)", "C)", "D)".
5. O campo 'answer' deve ser APENAS a letra da resposta correta ("A", "B", "C" ou "D").
6. O conteúdo deve ser didático, profissional e engajador.
7. O idioma deve ser Português do Brasil.

TEMA DO CURSO: {{ $json.body.theme }}
```

---

### Nó 3: Respond to Webhook
Este nó envia a resposta de volta para a aplicação.

- **Respond With:** `JSON`
- **Body:** `{ "output": <Saída do Nó de IA> }`
  - *Nota:* A aplicação verifica se existe uma chave `output` contendo o JSON stringify ou o objeto, ou se o corpo já é o objeto diretamente. A forma mais segura é garantir que o nó de IA retorne o objeto e você passe ele aqui.

Se o seu nó de IA retornar o texto do JSON como uma string na variável `text`, configure o Body do Webhook Response para:
```json
{
  "output": {{ $json.text }}
}
```
Ou, se configurou o parser de JSON no n8n e ele já é um objeto:
```json
{{ $json.output }}
```

## 3. Validação (Checklist)

A aplicação `TinyLesson` possui um validador rígido (`validateResponse` em `api/mini-course/route.ts`).
Se o seu JSON falhar em qualquer um destes pontos, o curso não será gerado:

1.  **Tipos de Dados:** `title` deve ser string, `modules` array, etc.
2.  **Quiz Options:** Devem ser strings. A aplicação espera formato "A) Texto", mas tenta corrigir se vier diferente. O ideal é já enviar com as letras.
3.  **Quiz Answer:** Deve ser estritamente "A", "B", "C", ou "D".
4.  **Estrutura Aninhada:** `modules` -> `lessons` e `modules` -> `quiz`.

## 4. Solução de Problemas (Troubleshooting)

### Erro: "No prompt specified"
Este erro ocorre quando o nó "AI Agent" não recebe nenhum texto para processar.

**Causa:**
Você provavelmente clicou no botão "Test Step" / "Execute" do n8n sem ter enviado dados reais para o Webhook. Como resultado, a variável `{{ $json.body.theme }}` fica vazia, e o Agente reclama que não tem "prompt".

**Como corrigir:**
O fluxo precisa de dados de entrada (`theme`) para funcionar.
1. **Teste Real (Recomendado):** Deixe o workflow ativo ou em modo "Listening", vá até o aplicativo TinyLesson (localhost) e gere um curso. Isso enviará o tema real para o n8n.
2. **Dados de Teste no n8n:** No nó **Webhook**, use a opção "Test Input" ou fixe dados (Pin Data) com o seguinte JSON:
   ```json
   {
     "body": {
       "theme": "História da Arte Moderna"
     }
   }
   ```
Assim, quando você clicar em testar o nó Agente, ele terá um tema para processar.
