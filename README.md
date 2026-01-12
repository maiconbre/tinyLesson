# TinyLesson 📚✨
### O Seu Mini Guia de Bolso com Inteligência Artificial

TinyLesson é uma plataforma de **micro-learning** (aprendizado rápido) que gera cursos expressos sob demanda sobre qualquer tópico. Basta digitar o que você quer aprender, e nossa IA cria um guia estruturado, bonito e interativo em segundos.

![TinyLesson Preview](https://github.com/user-attachments/assets/PLACEHOLDER_IMAGE)

## 🚀 Funcionalidades Principais

- **Geração de Cursos via IA**: Integração com **n8n** e LLMs (GPT-4o/Claude) para criar conteúdo pedagógico de alta qualidade.
- **Micro-Learning Estruturado**:
  - **Objetivos Claros**: O que você vai aprender.
  - **Módulos Curtos**: 5 módulos diretos ao ponto.
  - **Quizzes Interativos**: Perguntas de fixação com feedback imediato e explicações detalhadas.
  - **Glossário e Dicas**: Recursos extras para aprofundamento.
- **Design Premium & Temas Dinâmicos**:
  - ☀️ **Modo Light (Paper)**: Fundo creme com textura de papel e ruído suave. Ideal para leitura focada.
  - 🌙 **Modo Dark (Galaxy)**: Fundo espacial profundo, com um céu estrelado animado (estrelas que cintilam lentamente) e nebulosas. Ideal para imersão.
- **Performance Otimizada**:
  - Texturas CSS nativas (sem imagens pesadas).
  - Animações fluidas com **Framer Motion**.
  - Hydration safe.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Animações**: [Framer Motion](https://www.framer.com/motion/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Backend / AI Orchestration**: [n8n](https://n8n.io/) (Webhook + AI Agent)
- **Deploy**: [Vercel](https://vercel.com/)

## 🏁 Como Rodar Localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/tinyLesson.git
   cd tinyLesson
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configure o Webhook:**
   - Abra `src/app/api/mini-course/route.ts`.
   - Atualize a variável `WEBHOOK_URL` com a URL do seu workflow do n8n (Production URL).

4. **Rode o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000).

## 🤖 Configuração do n8n (Backend AI)

Para que a geração de cursos funcione, você precisa de um workflow no n8n.

1.  **Crie um Workflow** com um nó `Webhook` (POST).
2.  **Adicione um AI Agent** (conectado a um modelo como OpenAI ou Anthropic).
3.  **Prompt do Sistema**: Copie o conteúdo do arquivo `prompt-agent.md` deste repositório e cole na configuração do agente.
4.  **Output Parser**: Configure o parser para "Structured Output" e use o Schema JSON disponível em `n8n_output_schema.md`.
5.  **Resposta**: O n8n deve retornar um JSON no formato `{ "output": { ...conteudo... } }`.

## 📂 Estrutura do Projeto

```
src/
├── app/
│   ├── api/          # Rotas API (Proxy para n8n)
│   ├── globals.css   # Estilos globais (Temas, Estrelas, Ruído)
│   ├── layout.tsx    # Layout raiz (Provider de Tema)
│   └── page.tsx      # Página principal (Interface do Curso)
├── components/
│   ├── CourseModule/ # Componente de renderização dos módulos/quiz
│   ├── SearchInput/  # Barra de busca principal
│   └── ui/           # Componentes Shadcn/UI (Button, Card, etc.)
└── hooks/            # Hooks customizados (useMiniCourse)
```

## 📄 Licença

Este projeto é de uso livre para fins educacionais. Sinta-se à vontade para contribuir!

---
Feito com 🧡 e 🌌 por [Maicon.tsx](https://instagram.com/maicon.tsx)
