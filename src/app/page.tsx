'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMiniCourse } from '@/hooks/useMiniCourse';
import { CourseModule } from '@/components/CourseModule';
import { PdfButton } from '@/components/PdfGenerator';
import { Rating } from '@/components/Rating';
import { SearchInput } from '@/components/SearchInput';
import { useCourseStore } from '@/store/useCourseStore';


export default function Home() {
  const [theme, setTheme] = useState('');
  const [showRating, setShowRating] = useState(false);
  const { data, loading, error, progress, actions } = useMiniCourse();
  const rateTheme = useCourseStore(state => state.rateTheme);

  const handleSubmit = () => {
    if (theme.trim()) {
      actions.generateCourse(theme);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300 overflow-x-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold-900/20 via-dark-900 to-dark-900 dark:from-gold-900/5 dark:via-dark-900 dark:to-dark-900" />

      <div className="relative z-10">
        {/* Header */}
        <header className="pt-8 sm:pt-16 md:pt-20 pb-6 sm:pb-16 px-2 sm:px-6">
          <motion.div
            className="max-w-full sm:max-w-4xl mx-auto text-center"
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gold-400 mb-4 sm:mb-6">
               Mini Curso Generator
            </h1>
            <p className="text-base sm:text-xl text-foreground/80">
              Gere um pequeno curso sobre qualquer tema em segundos.
              <br className="hidden sm:block" />
              Compreenda qualquer tema em menos de 30 minutos de estudos.
              <br className="hidden sm:block" />
              Perfeito para revisão rápida.
            </p>
            
          </motion.div>
        </header>

        {/* Form Section */}
        <section className="px-4 sm:px-6 mb-12 sm:mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-full sm:max-w-xl md:max-w-2xl mx-auto"
          >
            <div className="relative">
              <SearchInput
                value={theme}
                onChange={setTheme}
                onSubmit={handleSubmit}
                loading={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400"
              >
                {error}
              </motion.div>
            )}
          </motion.div>
        </section>

        {/* Course Content */}
        {data && !loading && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 sm:px-6 pb-12 sm:pb-16 md:pb-20"
          >
            <div className="max-w-5xl mx-auto">
              {/* Objetivos */}
              <div className="mb-6 sm:mb-8 bg-background/50 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
                <h3 className="text-lg sm:text-xl font-semibold text-gold-400 mb-3 sm:mb-4">Objetivos</h3>
                <ul className="list-disc list-inside space-y-2 text-foreground/70">
                  {data.objectives.map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </div>

              {/* Módulos do Curso */}
              <div className="mb-8">
                {data.modules.map((module, index) => (
                  <CourseModule
                    key={index}
                    module={module}
                    index={index}
                    isActive={index === progress.currentModule}
                    onSelect={() => {
                      if (index === progress.currentModule) {
                        // Se clicar no módulo atual, define como -1 para "desselecionar"
                        actions.goToModule(-1);
                      } else {
                        actions.goToModule(index);
                      }
                    }}
                    completedLessons={progress.completedLessons}
                    onLessonComplete={(lessonId: number) => actions.markLessonComplete(index, lessonId)}
                  />
                ))}
              </div>

              {/* Glossário */}
              <div className="bg-background/50 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
                <h3 className="text-lg sm:text-xl font-semibold text-gold-400 mb-3 sm:mb-4">Glossário</h3>
                <div className="grid grid-cols-1 gap-2 sm:gap-4 sm:grid-cols-2 text-foreground/70">
                  {data.glossary.map((item, index) => (
                    <div key={index} className="bg-background/30 p-2 sm:p-4 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">{item.term}</h4>
                      <p>{item.definition}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumo Final */}
              {data.final_summary && (
                <div className="mt-6 sm:mt-8 bg-background/50 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
                  <h3 className="text-lg sm:text-xl font-semibold text-gold-400 mb-3 sm:mb-4">Resumo Final</h3>
                  <p className="text-foreground/70">{data.final_summary}</p>
                </div>
              )}

              {/* Dicas de Estudo */}
              {data.study_tips.length > 0 && (
                <div className="mt-6 sm:mt-8 bg-background/50 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
                  <h3 className="text-lg sm:text-xl font-semibold text-gold-400 mb-3 sm:mb-4">Dicas de Estudo</h3>
                  <ul className="list-decimal list-inside space-y-2 text-foreground/70">
                    {data.study_tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Controles de Navegação */}
              <div className="mt-6 sm:mt-8 flex justify-center sm:justify-between items-center flex-wrap gap-4">
                <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-center">
                  <PdfButton courseData={data} />
                  <button
                    onClick={() => setShowRating(true)}
                    className="px-2 sm:px-4 py-1.5 bg-gold-600 text-dark-900 rounded-lg hover:bg-gold-500 text-xs sm:text-base"
                  >
                    Avaliar Curso
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Modal de Avaliação */}
        <AnimatePresence>
          {showRating && (
            <Rating
              onRate={(score) => {
                rateTheme(theme, score);
                setShowRating(false);
              }}
              onClose={() => setShowRating(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
