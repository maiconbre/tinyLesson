import { Course, CourseModule, CourseLesson, CourseQuizQuestion, GlossaryItem } from '../../domain/entities/Course';
import { CourseGeneratorRepository } from '../../domain/repositories/CourseGeneratorRepository.interface';
import { GenerateCourseError, CourseValidationError } from '../../domain/errors/DomainError';

const WEBHOOK_URL = 'https://n8n.targetweb.tech/webhook/tiny-leson';

export class N8nCourseGenerator implements CourseGeneratorRepository {
    async generateCourse(theme: string): Promise<Course> {
        console.log('Iniciando chamada ao webhook n8n para tema:', theme);

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ theme }),
            });

            console.log('Status da resposta n8n:', response.status);

            if (!response.ok) {
                throw new GenerateCourseError(`Erro na chamada: ${response.status} ${response.statusText}`);
            }

            const text = await response.text();

            if (!text.trim()) {
                throw new GenerateCourseError('Resposta vazia do servidor n8n');
            }

            let data;
            try {
                const jsonContent = this.processResponse(text);
                data = JSON.parse(jsonContent);
            } catch (parseError: unknown) {
                console.error('Erro ao parsear JSON do n8n:', parseError);
                throw new CourseValidationError('Formato de resposta inválido');
            }

            const sanitizedData = this.sanitizeData(data);
            return this.validateResponse(sanitizedData);

        } catch (error: unknown) {
            if (error instanceof Error) {
                throw error;
            }
            throw new GenerateCourseError('Erro desconhecido ao comunicar com o gerador');
        }
    }

    private extractJsonFromMarkdown(text: string): string {
        try {
            const directParse = JSON.parse(text);
            if (directParse?.output) {
                text = directParse.output;
            }
        } catch {
            // Ignore
        }

        let match = text.match(/```\s*json\s*\n?([\s\S]*?)\n?\s*```/i);
        if (!match) {
            match = text.match(/```\s*\n?([\s\S]*?)\n?\s*```/);
        }

        if (!match) {
            try {
                const parsed = JSON.parse(text);
                return JSON.stringify(parsed);
            } catch {
                try {
                    const cleaned = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
                    const parsed = JSON.parse(cleaned);
                    return JSON.stringify(parsed);
                } catch {
                    throw new CourseValidationError('Formato de resposta inválido: não foi possível extrair JSON');
                }
            }
        }

        let jsonContent = match[1];
        jsonContent = jsonContent
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\')
            .replace(/\r\n/g, '\n')
            .replace(/\t/g, '  ')
            .trim();

        jsonContent = jsonContent.replace(/,(\s*[}\]])/g, '$1');

        try {
            jsonContent = jsonContent
                .replace(/\n\s*\n/g, '\n')
                .replace(/,(\s*[}\]])/g, '$1')
                .replace(/"quiz":\s*\[\s*\{/g, '"quiz": [{')
                .replace(/(["\]}])\s*([,\]}])/g, '$1$2');
            jsonContent = jsonContent.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
            const parsed = JSON.parse(jsonContent);

            if (parsed.modules) {
                parsed.modules = parsed.modules.map((module: Partial<CourseModule>) => {
                    module.module_title = module.module_title || '';
                    module.introduction = module.introduction || '';
                    module.lessons = Array.isArray(module.lessons) ? module.lessons : [];
                    module.quiz = Array.isArray(module.quiz) ? module.quiz : [];
                    module.quiz = module.quiz.map((q: Partial<CourseQuizQuestion>) => ({
                        question: String(q?.question || ''),
                        options: Array.isArray(q?.options) ? q.options.map(String) : [],
                        answer: String(q?.answer || ''),
                        explanation: String(q?.explanation || '')
                    }));
                    return module;
                });
            }
            return JSON.stringify(parsed);
        } catch {
            throw new CourseValidationError('Formato de resposta inválido: JSON malformado');
        }
    }

    private processResponse(content: string): string {
        try {
            const parsed = JSON.parse(content);
            let extracted = parsed;

            if (Array.isArray(parsed) && parsed.length > 0) {
                if (parsed[0]?.output) {
                    extracted = parsed[0].output;
                } else if (parsed[0]?.title && parsed[0]?.modules) {
                    extracted = parsed[0];
                }
            } else if (parsed?.output) {
                extracted = parsed.output;
            }

            if (typeof extracted === 'object' && extracted !== null) {
                return JSON.stringify(extracted);
            }

            if (typeof extracted === 'string') {
                return this.extractJsonFromMarkdown(extracted);
            }

            const normalized = content
                .replace(/\\\\n/g, '\\n')
                .replace(/\\\\"/g, '\\"')
                .replace(/\\\\t/g, '\\t');

            try {
                JSON.parse(normalized);
                return normalized;
            } catch {
                return content;
            }
        } catch {
            return this.extractJsonFromMarkdown(content);
        }
    }

    private sanitizeData(rawData: unknown): Course {
        const data = rawData as Partial<Course>;

        if (typeof data.title !== 'string' || !data.title.trim()) {
            data.title = 'Curso Gerado (Título Indisponível)';
        }

        data.objectives = Array.isArray(data.objectives) ? data.objectives.map(String) : [];
        data.glossary = Array.isArray(data.glossary) ? data.glossary : [];
        data.study_tips = Array.isArray(data.study_tips) ? data.study_tips.map(String) : [];
        data.final_summary = String(data.final_summary || 'Resumo não disponível.');

        if (!Array.isArray(data.modules)) {
            data.modules = [];
        }

        if (data.modules.length === 0) {
            data.modules = [{
                module_title: "Introdução",
                introduction: "Conteúdo sendo gerado...",
                lessons: [],
                quiz: []
            }];
        }

        data.modules = data.modules.map((module: CourseModule, index: number) => {
            const normalizedModule: CourseModule = {
                module_title: String(module?.module_title || `Módulo ${index + 1}`),
                introduction: String(module?.introduction || ''),
                lessons: Array.isArray(module?.lessons) ? module.lessons.map((lesson: CourseLesson) => ({
                    lesson_title: String(lesson?.lesson_title || 'Lição'),
                    content: String(lesson?.content || 'Conteúdo indisponível.'),
                    example: String(lesson?.example || '')
                })) : [],
                quiz: Array.isArray(module?.quiz) ? module.quiz : []
            };

            normalizedModule.quiz = normalizedModule.quiz.map((q: CourseQuizQuestion) => {
                const options = Array.isArray(q?.options)
                    ? q.options.map(String)
                    : ["A) Opção 1", "B) Opção 2"];

                let answer = String(q?.answer || 'A').trim().toUpperCase();
                if (answer.length > 1 && /^[A-D]\)/.test(answer)) {
                    answer = answer[0];
                }
                if (!/^[A-D]$/.test(answer)) answer = 'A';

                return {
                    question: String(q?.question || 'Questão sem enunciado'),
                    options,
                    answer,
                    explanation: String(q?.explanation || '')
                };
            });

            return normalizedModule;
        });

        return data as Course;
    }

    private validateResponse(data: Course): Course {
        if (!data || typeof data !== 'object') {
            throw new CourseValidationError('Dados não são um objeto válido');
        }

        const validation = {
            title: (v: unknown) => typeof v === 'string',
            objectives: (v: unknown) => Array.isArray(v) && v.every(item => typeof item === 'string'),
            modules: (v: unknown) => Array.isArray(v) && v.every((module: Partial<CourseModule>) => (
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

        const recordData = data as unknown as Record<string, unknown>;
        for (const [field, validator] of Object.entries(validation)) {
            if (!Object.prototype.hasOwnProperty.call(recordData, field)) {
                throw new CourseValidationError(`Campo ${field} está ausente`);
            }
            if (!validator(recordData[field])) {
                throw new CourseValidationError(`Campo ${field} está em formato inválido`);
            }
        }

        return data;
    }
}
