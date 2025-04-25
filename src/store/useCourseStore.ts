import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Rating {
  theme: string;
  score: number;
  timestamp: number;
}

interface CourseStore {
  // Histórico de temas vistos
  history: string[];
  // Avaliações dos cursos
  ratings: Rating[];
  // Gerenciamento de histórico
  addToHistory: (theme: string) => void;
  clearHistory: () => void;
  // Gerenciamento de avaliações
  rateTheme: (theme: string, score: number) => void;
  getRating: (theme: string) => Rating | undefined;
  // Estado do tema atual
  currentTheme: string | null;
  setCurrentTheme: (theme: string | null) => void;
}

export const useCourseStore = create<CourseStore>()(
  persist(
    (set, get) => ({
      history: [],
      ratings: [],
      currentTheme: null,

      addToHistory: (theme) => set((state) => ({
        history: [theme, ...state.history.filter(t => t !== theme)].slice(0, 10)
      })),

      clearHistory: () => set({ history: [] }),

      rateTheme: (theme, score) => set((state) => ({
        ratings: [
          { theme, score, timestamp: Date.now() },
          ...state.ratings.filter(r => r.theme !== theme)
        ]
      })),

      getRating: (theme) => get().ratings.find(r => r.theme === theme),

      setCurrentTheme: (theme) => {
        set({ currentTheme: theme });
        if (theme) {
          get().addToHistory(theme);
        }
      }
    }),
    {
      name: 'course-storage',
      partialize: (state) => ({
        history: state.history,
        ratings: state.ratings,
      })
    }
  )
);
