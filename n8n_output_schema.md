# Schema JSON Correto para o n8n Output Parser

O erro `missing properties: 'output'` indica que o schema atual no n8n está esperando um objeto encapsulado dentro de "output", mas a sua validação no frontend espera os campos diretamente.

Para corrigir e alinhar com o nosso Frontend (`src/app/api/mini-course/route.ts`), **use este Schema JSON exato** no nó **Structured Output Parser** do n8n.

### JSON Schema para Copiar e Colar:

```json
{
  "type": "object",
  "properties": {
    "output": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string",
          "description": "O título principal vibrante e comercial do minicurso"
        },
        "objectives": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Lista de 3 a 5 objetivos claros de aprendizado"
        },
        "modules": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "module_title": {
                "type": "string",
                "description": "Título do módulo"
              },
              "introduction": {
                "type": "string",
                "description": "Uma introdução breve ao conceito do módulo"
              },
              "lessons": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "lesson_title": {
                      "type": "string",
                      "description": "Título da lição"
                    },
                    "content": {
                      "type": "string",
                      "description": "O conteúdo explicativo detalhado e didático da lição (sem markdown)"
                    },
                    "example": {
                      "type": "string",
                      "description": "Um exemplo prático ou analogia para fixar o conceito"
                    }
                  },
                  "required": ["lesson_title", "content", "example"]
                }
              },
              "quiz": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "question": {
                      "type": "string",
                      "description": "A pergunta do quiz"
                    },
                    "options": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "description": "Array com 4 opções de resposta (A, B, C, D)"
                    },
                    "answer": {
                      "type": "string",
                      "enum": ["A", "B", "C", "D"],
                      "description": "A letra da resposta correta"
                    },
                    "explanation": {
                      "type": "string",
                      "description": "Breve explicação do porquê está correta"
                    }
                  },
                  "required": ["question", "options", "answer", "explanation"]
                }
              }
            },
            "required": ["module_title", "introduction", "lessons", "quiz"]
          },
          "minItems": 5,
          "description": "Array de módulos do curso (Mínimo 5 módulos)"
        },
        "glossary": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "term": {
                "type": "string"
              },
              "definition": {
                "type": "string"
              }
            },
            "required": ["term", "definition"]
          },
          "description": "Termos chave e suas definições"
        },
        "study_tips": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Dicas práticas para aplicar o conhecimento"
        },
        "final_summary": {
          "type": "string",
          "description": "Um parágrafo encorajador de conclusão"
        }
      },
      "required": [
        "title",
        "objectives",
        "modules",
        "glossary",
        "study_tips",
        "final_summary"
      ]
    }
  },
  "required": [
    "output"
  ]
}
```

### Onde Colar no n8n:
1. Abra o nó **AI Agent**.
2. Vá nas configurações do **Output Parser** (geralmente conectado na parte inferior do nó).
3. Selecione o modo **Structured Output Parser**.
4. No campo **Schema Source**, escolha **Define below (JSON Schema)**.
5. Cole o JSON acima no campo **Json Schema**.

Isso forçará a IA a seguir exatamente a estrutura que o nosso site espera, eliminando o erro de validação (400) e propriedades inválidas.
