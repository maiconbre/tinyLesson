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
  };
  generationProgress: number; // Add generationProgress here
  actions: UseMiniCourseActions;
}


export function useMiniCourse(): UseMiniCourseReturn {
  const [data, setData] = useState<MiniCourse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0); // Initialize generationProgress state
  const [progress, setProgress] = useState({
    currentModule: 0,
    currentLesson: 0,
    completedLessons: new Set<string>()
  });

  const generateCourse = async (theme: string) => {
    if (!theme) return;

    let progressInterval: ReturnType<typeof setInterval> | undefined; // Variable to hold the interval ID

    try {
      setLoading(true);
      setError(null);
      setData(null);
      setGenerationProgress(0); // Reset progress

      // Simulação de progresso não-linear baseada no comportamento típico de LLMs
      const updateProgress = () => {
        setGenerationProgress(prev => {
          // Fase 1: Início rápido (0-30% em ~2s) - Conexão e envio
          if (prev < 30) {
            return prev + 2;
          }
          // Fase 2: Processamento (30-70% em ~10s) - Thinking/Reasoning
          if (prev < 70) {
            return prev + 0.8;
          }
          // Fase 3: Geração Longa (70-90% em ~30s) - Streaming tokens
          if (prev < 90) {
            return prev + 0.2;
          }
          // Fase 4: Finalização (90-95% lentíssimo) - JSON parsing/validating
          if (prev < 95) {
            return prev + 0.05;
          }
          return prev;
        });
      };

      // Atualiza a cada 300ms para suavidade
      progressInterval = setInterval(updateProgress, 300);

      const response = await fetch('/api/mini-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme }),
      });

      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = undefined;
      }
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Falha ao gerar o mini curso');
      }

      if (!responseData.title || !Array.isArray(responseData.modules)) {
        throw new Error('Resposta inválida do servidor');
      }

      setData(responseData);
      setGenerationProgress(100); // Generation complete
      setProgress({
        currentModule: 0,
        currentLesson: 0,
        completedLessons: new Set()
      });

    } catch (err) {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = undefined;
      }
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Erro ao gerar curso:', errorMessage);
      setError(errorMessage);
      setData(null);
      setGenerationProgress(100); // Also set to 100 on error to stop progress bar
    } finally {
      // Ensure interval is cleared if it somehow wasn't before
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

      setProgress(prev => {
        const currentModule = data.modules[prev.currentModule];
        if (!currentModule) return prev;

        // Se está na última lição do módulo atual
        if (prev.currentLesson === currentModule.lessons.length - 1) {
          // Se há próximo módulo
          if (prev.currentModule < data.modules.length - 1) {
            return {
              ...prev,
              currentModule: prev.currentModule + 1,
              currentLesson: 0
            };
          }
          return prev; // Está no final do curso
        }

        // Avança para próxima lição
        return {
          ...prev,
          currentLesson: prev.currentLesson + 1
        };
      });
    },

    previousLesson: () => {
      if (!data) return;

      setProgress(prev => {
        // Se está na primeira lição do módulo atual
        if (prev.currentLesson === 0) {
          // Se há módulo anterior
          if (prev.currentModule > 0) {
            const previousModule = data.modules[prev.currentModule - 1];
            return {
              ...prev,
              currentModule: prev.currentModule - 1,
              currentLesson: previousModule.lessons.length - 1
            };
          }
          return prev; // Está no início do curso
        }

        // Volta para lição anterior
        return {
          ...prev,
          currentLesson: prev.currentLesson - 1
        };
      });
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

    reset: () => {
      setProgress({
        currentModule: 0,
        currentLesson: 0,
        completedLessons: new Set()
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
