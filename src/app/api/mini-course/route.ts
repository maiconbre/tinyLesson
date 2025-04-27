import { NextResponse } from 'next/server';
import { MiniCourse, Module, Lesson, QuizQuestion, GlossaryItem } from '@/hooks/useMiniCourse';

const WEBHOOK_URL = 'https://n8n.targetweb.tech/webhook/f3cdcfd1-71d8-46fb-b6cd-c855cdd8e1db';

const extractJsonFromMarkdown = (text: string): string => {
  console.log('Extraindo JSON do markdown, tamanho do texto:', text.length);

  try {
    // Primeiro tenta parsear o texto diretamente
    const directParse = JSON.parse(text);
    if (directParse?.output) {
      text = directParse.output;
    }
  } catch {
    
  }

  // Procura por blocos de código JSON (tolerante a espaços, quebras de linha e ausência de linguagem)
  let match = text.match(/```\s*json\s*\n?([\s\S]*?)\n?\s*```/i);
  if (!match) {
    // Tenta bloco sem linguagem
    match = text.match(/```\s*\n?([\s\S]*?)\n?\s*```/);
  }
  if (!match) {
    console.error('Não foi encontrado bloco de código JSON na resposta');
    // Tenta parsear o texto diretamente se não encontrar bloco markdown
    try {
      const parsed = JSON.parse(text);
      return JSON.stringify(parsed);
    } catch {
      // Remove caracteres de controle e tenta novamente
      try {
        const cleaned = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
        const parsed = JSON.parse(cleaned);
        return JSON.stringify(parsed);
      } catch {
        throw new Error('Formato de resposta inválido: não foi possível extrair JSON');
      }
    }
  }

  let jsonContent = match[1];
  console.log('Bloco JSON encontrado, tamanho:', jsonContent.length);

  // Remove caracteres de escape extras e normaliza quebras de linha
  jsonContent = jsonContent
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, '  ')
    .trim();

  // Corrige possíveis problemas de formatação
  jsonContent = jsonContent.replace(/,(\s*[}\]])/g, '$1');

  // Tenta parsear o JSON com tratamento adicional de formatação
  try {
    // Remove quebras de linha duplicadas e vírgulas extras
    jsonContent = jsonContent
      .replace(/\n\s*\n/g, '\n')
      .replace(/,(\s*[}\]])/g, '$1')
      .replace(/"quiz":\s*\[\s*\{/g, '"quiz": [{')
      .replace(/(["\]}])\s*([,\]}])/g, '$1$2');
    // Remove caracteres de controle
    jsonContent = jsonContent.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    const parsed = JSON.parse(jsonContent);
    console.log('JSON é válido, contém campos:', Object.keys(parsed));
    // Verifica e corrige estrutura dos módulos
    if (parsed.modules) {
      parsed.modules = parsed.modules.map((module: Partial<Module>) => {
        module.module_title = module.module_title || '';
        module.introduction = module.introduction || '';
        module.lessons = Array.isArray(module.lessons) ? module.lessons : [];
        module.quiz = Array.isArray(module.quiz) ? module.quiz : [];
        module.quiz = module.quiz.map((q: Partial<QuizQuestion>) => ({
          question: String(q?.question || ''),
          options: Array.isArray(q?.options) ? q.options.map(String) : [],
          answer: String(q?.answer || ''),
          explanation: String(q?.explanation || '')
        }));
        return module;
      });
    }
    return JSON.stringify(parsed);
  } catch (error) {
    console.error('Erro ao validar JSON:', error);
    console.error('Conteúdo problemático:', jsonContent.substring(0, 200));
    throw new Error('Formato de resposta inválido: JSON malformado');
  }
};

const validateResponse = (data: Record<string, unknown>): MiniCourse => {
  console.log('Validando estrutura da resposta:', JSON.stringify(data, null, 2));

  if (!data) {
    throw new Error('Dados vazios');
  }

  // Verifica se é um objeto
  if (typeof data !== 'object' || data === null) {
    throw new Error('Dados não são um objeto válido');
  }

  // Lista de campos obrigatórios e seus tipos esperados
  const validation = {
    title: (v: unknown) => typeof v === 'string',
    objectives: (v: unknown) => Array.isArray(v) && v.every(item => typeof item === 'string'),
    modules: (v: unknown) => Array.isArray(v) && v.every((module: Partial<Module>) => (
      typeof module.module_title === 'string' &&
      typeof module.introduction === 'string' &&
      Array.isArray(module.lessons) &&
      Array.isArray(module.quiz) &&
      module.quiz.every((q: { question: string; options: string[]; answer: string; explanation: string; }) => 
        typeof q.question === 'string' &&
        Array.isArray(q.options) &&
        q.options.every((opt: string) => typeof opt === 'string') &&
        typeof q.answer === 'string' &&
        typeof q.explanation === 'string'
      )
    )),
    glossary: (v: unknown) => Array.isArray(v) && v.every((item: Partial<GlossaryItem>) => (
      typeof item.term === 'string' &&
      typeof item.definition === 'string'
    )),
    study_tips: (v: unknown) => Array.isArray(v) && v.every(item => typeof item === 'string'),
    final_summary: (v: unknown) => typeof v === 'string'
  };

  // Verifica cada campo
  for (const [field, validator] of Object.entries(validation)) {
    console.log(`Validando campo: ${field}`);
    console.log(`Valor do campo:`, data[field]);

    if (!Object.prototype.hasOwnProperty.call(data, field)) {
      console.error(`Campo "${field}" não existe nos dados`);
      throw new Error(`Campo ${field} está ausente`);
    }

    if (!validator(data[field])) {
      console.error(`Campo "${field}" falhou na validação:`, data[field]);
      throw new Error(`Campo ${field} está em formato inválido`);
    }

    console.log(`Campo "${field}" validado com sucesso`);
  }

  // First cast to unknown, then to MiniCourse to avoid direct type assertion error
  return (data as unknown) as MiniCourse;
};

const callWebhook = async (theme: string) => {
  console.log('Iniciando chamada ao webhook para tema:', theme);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ theme }),
    });

    console.log('Status da resposta:', response.status);
    
    if (!response.ok) {
      throw new Error(`Erro na chamada: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    console.log('Resposta bruta recebida:', text.substring(0, 200) + '...');

    if (!text.trim()) {
      throw new Error('Resposta vazia do servidor');
    }

    try {
      // Processa e extrai o JSON da resposta
      let data;
      console.log('Processando conteúdo da resposta');
      
      const processResponse = (content: string) => {
        try {
          const parsed = JSON.parse(content);
          // Se for objeto com output, retorna o conteúdo do output
          if (parsed?.output) {
            console.log('Encontrado campo output no JSON');
            return extractJsonFromMarkdown(parsed.output);
          }
          // Se for array com output, retorna o conteúdo do primeiro output
          if (Array.isArray(parsed) && parsed[0]?.output) {
            console.log('Encontrado array com output');
            return extractJsonFromMarkdown(parsed[0].output);
          }
          // Se for JSON válido direto, normaliza e retorna
          const normalized = content
            .replace(/\\\\n/g, '\\n')  // Corrige escape duplo de quebras de linha
            .replace(/\\\\"/g, '\\"')  // Corrige escape duplo de aspas
            .replace(/\\\\t/g, '\\t'); // Corrige escape duplo de tabs

          try {
            // Testa se o conteúdo normalizado é válido
            JSON.parse(normalized);
            return normalized;
          } catch {
            // Se não for válido, retorna o conteúdo original
            return content;
          }
        } catch {
          // Se não for JSON válido, tenta extrair do markdown
          console.log('Tentando extrair do markdown');
          return extractJsonFromMarkdown(content);
        }
      };

      // Processa a resposta para extrair e validar o JSON
      const jsonContent = processResponse(text);
      data = JSON.parse(jsonContent);
      console.log('Dados processados:', Object.keys(data));

      // Sanitiza os dados antes da validação
      console.log('Dados antes da sanitização:', data);
      const sanitizeData = (data: Record<string, unknown>) => {
        console.log('Iniciando sanitização dos dados');
        
        // Garante que os campos base existam
        data = {
          title: String(data?.title || ''),
          objectives: Array.isArray(data?.objectives) ? data.objectives.map(String) : [],
          modules: Array.isArray(data?.modules) ? data.modules : [],
          glossary: Array.isArray(data?.glossary) ? data.glossary : [],
          study_tips: Array.isArray(data?.study_tips) ? data.study_tips.map(String) : [],
          final_summary: String(data?.final_summary || '')
        };

        // Valida campos obrigatórios
        if (typeof data.title !== 'string' || !data.title.trim()) {
          throw new Error('Campo title é obrigatório');
        }

        // Normaliza os módulos
        data.modules = (data.modules as Array<Partial<Module>>).map((module: Partial<Module>, index: number) => {
          console.log(`Sanitizando módulo ${index + 1}/${(data.modules as Array<unknown>).length}`);
          console.log(`Módulo ${index + 1}: ${module?.module_title || 'Sem título'}`);
          
          // Normaliza campos do módulo
          const normalizedModule = {
            module_title: String(module?.module_title || ''),
            introduction: String(module?.introduction || ''),
            lessons: Array.isArray(module?.lessons) ? module.lessons.map((lesson: Partial<Lesson>) => ({
              lesson_title: String(lesson?.lesson_title || ''),
              content: String(lesson?.content || ''),
              example: String(lesson?.example || '')
            })) : [],
            quiz: Array.isArray(module?.quiz) ? module.quiz : []
          };

          // Normaliza o quiz
          normalizedModule.quiz = normalizedModule.quiz.map((q: Partial<QuizQuestion>, qIndex: number) => {
            const options = Array.isArray(q?.options) 
              ? q.options.map((opt: unknown, i: number) => {
                  const option = String(opt).trim();
                  // Garante que a opção está no formato correto (A), B), etc)
                  if (!option.startsWith(String.fromCharCode(65 + i) + ')')) {
                    return `${String.fromCharCode(65 + i)}) ${option.replace(/^[A-D]\)\s*/, '')}`;
                  }
                  return option;
                })
              : [];

            // Verifica se a resposta está no formato correto
            let answer = String(q?.answer || '');
            if (!/^[A-D]$/.test(answer)) {
              console.warn(`Resposta do quiz ${qIndex + 1} malformada, tentando corrigir:`, answer);
              // Tenta extrair a letra da resposta
              const match = answer.match(/[A-D]/);
              answer = match ? match[0] : 'A';
            }

            return {
              question: String(q?.question || ''),
              options,
              answer,
              explanation: String(q?.explanation || '')
            };
          });

          return normalizedModule;
        });

        // Normaliza o glossário
        data.glossary = (data.glossary as Array<Partial<GlossaryItem>>).map((item: Partial<GlossaryItem>) => ({
          term: String(item?.term || ''),
          definition: String(item?.definition || '')
        }));

        console.log('Sanitização concluída com sucesso');
        return data;
      };

      data = sanitizeData(data);

      console.log('JSON parseado com sucesso');
      console.log('Estatísticas do curso:');
      console.log(`- Título: ${data.title}`);
      console.log(`- Objetivos: ${Array.isArray(data.objectives) ? data.objectives.length : 0}`);
      console.log(`- Módulos: ${Array.isArray(data.modules) ? data.modules.length : 0}`);
      console.log(`- Total de lições: ${(data.modules as Module[]).reduce((acc: number, m: { lessons: Lesson[] }) => acc + m.lessons.length, 0)}`);
      console.log(`- Total de questões: ${(data.modules as Module[]).reduce((acc: number, m: { quiz: QuizQuestion[] }) => acc + m.quiz.length, 0)}`);
      console.log(`- Termos no glossário: ${Array.isArray(data.glossary) ? data.glossary.length : 0}`);
      console.log(`- Dicas de estudo: ${Array.isArray(data.study_tips) ? data.study_tips.length : 0}`);
      return validateResponse(data);
    } catch (parseError) {
      console.error('Erro ao parsear JSON:', parseError);
      console.error('Texto recebido:', text);
      throw new Error('Formato de resposta inválido');
    }

  } catch (error) {
    console.error('Erro na chamada do webhook:', error);
    throw error;
  }
};

export async function POST(request: Request) {
  console.log('Recebendo requisição POST para geração de curso');

  try {
    const body = await request.json();
    console.log('Corpo da requisição:', body);

    const { theme } = body;

    if (!theme || typeof theme !== 'string' || theme.trim().length === 0) {
      console.log('Tema inválido fornecido');
      return NextResponse.json(
        { error: 'O tema é obrigatório e deve ser uma string não vazia' },
        { status: 400 }
      );
    }

    try {
      const data = await callWebhook(theme);
      console.log('Curso gerado com sucesso');
      
      return NextResponse.json(data);
    } catch (apiError) {
      console.error('Erro ao processar resposta da API:', apiError);
      return NextResponse.json(
        { error: apiError instanceof Error ? apiError.message : 'Erro ao processar resposta' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
