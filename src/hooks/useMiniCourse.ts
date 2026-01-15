import { useState, useEffect } from 'react';

export interface Lesson {
  lesson_title: string;
  content: string;
  example: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface Module {
  module_title: string;
  introduction: string;
  lessons: Lesson[];
  quiz: QuizQuestion[];
}

export interface GlossaryItem {
  term: string;
  definition: string;
}

export interface MiniCourse {
  title: string;
  objectives: string[];
  modules: Module[];
  glossary: GlossaryItem[];
  final_summary: string;
  study_tips: string[];
}

export interface UseMiniCourseActions {
  generateCourse: (theme: string) => Promise<void>;
  nextLesson: () => void;
  previousLesson: () => void;
  goToModule: (moduleId: number) => void;
  markLessonComplete: (moduleId: number, lessonId: number) => void;
  markQuestionComplete: (moduleId: number, questionIndex: number) => void; // Nova ação
  unlockNextModule: (currentModuleId: number) => void;
  reset: () => void;
}

export interface UseMiniCourseReturn {
  data: MiniCourse | null;
  loading: boolean;
  error: string | null;
  progress: {
    currentModule: number;
    currentLesson: number;
    completedLessons: Set<string>;
    completedQuestions: Set<string>; // Nova propriedade
    maxUnlockedModule: number;
  };
  generationProgress: number;
  actions: UseMiniCourseActions;
}


export function useMiniCourse(): UseMiniCourseReturn {
  const [data, setData] = useState<MiniCourse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [progress, setProgress] = useState({
    currentModule: 0,
    currentLesson: 0,
    completedLessons: new Set<string>(),
    completedQuestions: new Set<string>(), // Init
    maxUnlockedModule: 0
  });

  const generateCourse = async (theme: string) => {
    if (!theme) return;

    let progressInterval: ReturnType<typeof setInterval> | undefined;

    try {
      setLoading(true);
      setError(null);
      setData(null);
      setGenerationProgress(0); // Reset progress start

      // Variável mutável para controle de velocidade dentro do intervalo
      let currentSpeedMultiplier = 1;
      let targetProgress = 99; // Target to reach asymptotically

      // Simulação de progresso não-linear baseada no comportamento típico de LLMs
      const updateProgress = () => {
        setGenerationProgress(prev => {
          // Se chegamos no target, paramos
          if (prev >= targetProgress) return prev;

          let increment = 0;

          // Fase 1: Início rápido (0-30%)
          if (prev < 30) {
            increment = 2;
          }
          // Fase 2: Processamento (30-60%)
          else if (prev < 60) {
            increment = 0.8;
          }
          // Fase 3: Geração Longa (60-85%)
          else if (prev < 85) {
            increment = 0.4;
          }
          // Fase 4: Finalização / Retry (85-99%) - Asymptotic approach
          else {
            // Decaimento exponencial: Quanto mais perto do fim, menor o passo
            const distance = targetProgress - prev;
            increment = Math.max(0.02, distance * 0.05);
          }

          // Aplica multiplicador de velocidade (usado no retry para "correr atrás")
          return Math.min(targetProgress, prev + (increment * currentSpeedMultiplier));
        });
      };

      // Atualiza a cada 300ms 
      progressInterval = setInterval(updateProgress, 300);

      // TENTATIVA E ERRO (RETRY LOOP)
      const MAX_RETRIES = 2;
      let lastErrorIgnoringRetry = null;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {

          // SE FOR RETRY (Tentativa 2+), acelera o progresso visual para dar feedback "vivo"
          if (attempt > 1) {
            // Pula o progresso se estiver muito atrasado (para parecer que já avançou)
            setGenerationProgress(prev => Math.max(prev, 65));
            // Aumenta velocidade para chegar nos 90% logo
            currentSpeedMultiplier = 3.0; // 3x mais rápido
          }

          // eslint-disable-next-line
          const response = await fetch('/api/mini-course', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ theme }),
          });

          const responseData = await response.json();

          if (!response.ok) {
            throw new Error(responseData.error || 'Falha ao gerar o mini curso');
          }

          if (!responseData.title || !Array.isArray(responseData.modules)) {
            throw new Error('Resposta inválida do servidor');
          }

          // SUCESSO!
          if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = undefined;
          }

          setData(responseData);
          setGenerationProgress(100);

          setProgress({
            currentModule: 0,
            currentLesson: 0,
            completedLessons: new Set(),
            completedQuestions: new Set(),
            maxUnlockedModule: 0
          });

          return; // Sai da função com sucesso

        } catch (err: unknown) {
          console.warn(`Tentativa ${attempt} falhou:`, err);
          lastErrorIgnoringRetry = err;

          if (attempt === MAX_RETRIES) {
            throw err; // Lança erro final
          }

          // Se vai tentar de novo, garantimos que o progresso continue rodando
          // e na próxima iteração do loop, o "if (attempt > 1)" vai acelerar as coisas
        }
      }

    } catch (err) {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = undefined;
      }
      const rawError = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Erro final ao gerar curso:', rawError);

      let friendlyMessage = 'Ocorreu um erro inesperado. Por favor, tente novamente.';

      if (rawError.includes('Resposta vazia') || rawError.includes('JSON')) {
        friendlyMessage = 'Não conseguimos gerar o curso para este tema. Tente usar palavras-chave diferentes ou ser mais específico.';
      } else if (rawError.includes('Falha ao gerar') || rawError.includes('inválida')) {
        friendlyMessage = 'Houve um problema na comunicação com nossa IA. Tente novamente em alguns segundos.';
      } else if (rawError.includes('Network') || rawError.includes('fetch')) {
        friendlyMessage = 'Verifique sua conexão com a internet e tente novamente.';
      }

      setError(friendlyMessage);
      setData(null);
      setGenerationProgress(100); // Finaliza visualmente com erro
    } finally {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = undefined;
      }
      setLoading(false);
    }
  };

  // Salva progresso no localStorage quando muda
  useEffect(() => {
    if (data?.title) {
      localStorage.setItem(`course-progress-${data.title}`, JSON.stringify({
        ...progress,
        completedLessons: Array.from(progress.completedLessons)
      }));
    }
  }, [progress, data]);

  const actions = {
    generateCourse,
    nextLesson: () => {
      if (!data) return;

      const currentModuleData = data.modules[progress.currentModule];
      if (progress.currentLesson < currentModuleData.lessons.length - 1) {
        setProgress(prev => ({ ...prev, currentLesson: prev.currentLesson + 1 }));
      } else if (progress.currentModule < data.modules.length - 1) {
        // Only move to next module if unlocked? Or assume standard nav allows it if unlocked.
        // Actually this is just standard prev/next nav logic.
        // We defer locking checks to the UI mostly, or strict checks here.
        // For now keep standard.
        setProgress(prev => ({
          ...prev,
          currentModule: prev.currentModule + 1,
          currentLesson: 0
        }));
      }
    },
    previousLesson: () => {
      if (!data) return;
      if (progress.currentLesson > 0) {
        setProgress(prev => ({ ...prev, currentLesson: prev.currentLesson - 1 }));
      } else if (progress.currentModule > 0) {
        const prevModule = data.modules[progress.currentModule - 1];
        setProgress(prev => ({
          ...prev,
          currentModule: progress.currentModule - 1,
          currentLesson: prevModule.lessons.length - 1
        }));
      }
    },
    goToModule: (moduleId: number) => {
      if (!data) return;
      if (moduleId < -1 || (moduleId >= data.modules.length && moduleId !== -1)) return;

      setProgress(prev => ({
        ...prev,
        currentModule: moduleId,
        currentLesson: 0
      }));
    },

    markLessonComplete: (moduleId: number, lessonId: number) => {
      setProgress(prev => ({
        ...prev,
        completedLessons: new Set(prev.completedLessons).add(`${moduleId}-${lessonId}`)
      }));
    },

    markQuestionComplete: (moduleId: number, questionIndex: number) => {
      setProgress(prev => ({
        ...prev,
        completedQuestions: new Set(prev.completedQuestions || new Set()).add(`${moduleId}-${questionIndex}`)
      }));
    },

    unlockNextModule: (currentModuleId: number) => {
      setProgress(prev => {
        const nextModule = currentModuleId + 1;
        // Só atualiza se o próximo módulo ainda não estiver desbloqueado, e se for um módulo válido (embora o check de limite seja feito na UI via modules.length, é bom garantir)
        // Mas como não temos data.modules aqui dentro facilmente sem plumbs, apenas confiamos no ID sequencial.
        if (nextModule > prev.maxUnlockedModule) {
          return {
            ...prev,
            maxUnlockedModule: nextModule
          };
        }
        return prev;
      });
    },

    reset: () => {
      setProgress({
        currentModule: 0,
        currentLesson: 0,
        completedLessons: new Set(),
        completedQuestions: new Set(),
        maxUnlockedModule: 0
      });
      if (data?.title) {
        localStorage.removeItem(`course-progress-${data.title}`);
      }
    }
  };

  return {
    data,
    loading,
    error,
    progress,
    generationProgress, // Return generationProgress
    actions,
  };
}
