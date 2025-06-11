'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMiniCourse } from '@/hooks/useMiniCourse';
import { CourseModule } from '@/components/CourseModule';
import { PdfButton } from '@/components/PdfGenerator';
import { Rating } from '@/components/Rating';
import { SearchInput } from '@/components/SearchInput';
import { useCourseStore } from '@/store/useCourseStore';


const listItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.07,
      duration: 0.3,
      ease: "easeOut"
    }
  })
};

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
        <header className="pt-12 sm:pt-16 md:pt-20 pb-8 sm:pb-12 px-4 sm:px-6"> {/* Adjusted pb and px */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-full sm:max-w-4xl mx-auto text-center"
          >
            <h1 className="text-2xl md:text-5xl font-bold text-gold-400 mb-4 sm:mb-6">
               Mini Curso Gen.
            </h1>
            <p className="text-sm sm:text-xl text-foreground/80">
              Um pequeno curso, qualquer tema  <br/>
              <br className="hidden sm:block" />
              em segundos.<br/>
              <br className="hidden sm:block" />
              <span className="text-xs">30 minutos de estudos.</span>

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
            transition={{ duration: 0.5 }}
            className="px-4 sm:px-6 pb-12 sm:pb-16 md:pb-20"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gold-400 mb-6 text-center">
              {data.title}
            </h2>
            <div className="max-w-5xl mx-auto">
              {/* Objetivos */}
              <div className="mb-6 sm:mb-8 bg-background/50 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
                <h3 className="text-lg sm:text-xl font-semibold text-gold-400 mb-3 sm:mb-4">Objetivos</h3>
                <ul className="list-disc list-inside space-y-2 text-foreground/70">
                  {data.objectives.map((objective, index) => (
                    <motion.li
                      key={index}
                      variants={listItemVariants}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                    >
                      {objective}
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Módulos do Curso */}
              <div className="mb-8">
                {data.modules.map((module, index) => (
                  <motion.div
                    key={index} // Ensure key is on the motion component if it's the direct child of map
                    variants={listItemVariants} // Optional: if you want modules themselves to stagger in
                    custom={index}
                    initial="hidden"
                    animate="visible"
                  >
                    <CourseModule
                      key={module.module_title} // It's good practice to have a stable key on the actual component
                      module={module}
                      index={index}
                      isActive={index === progress.currentModule}
                      onSelect={() => {
                        if (index === progress.currentModule) {
                          actions.goToModule(-1);
                        } else {
                          actions.goToModule(index);
                        }
                      }}
                      completedLessons={progress.completedLessons}
                      onLessonComplete={(lessonId: number) => actions.markLessonComplete(index, lessonId)}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Glossário */}
              <div className="bg-background/50 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
                <h3 className="text-lg sm:text-xl font-semibold text-gold-400 mb-3 sm:mb-4">Glossário</h3>
                <div className="grid grid-cols-1 gap-2 sm:gap-4 sm:grid-cols-2 text-foreground/70">
                  {data.glossary.map((item, index) => (
                    <motion.div
                      key={index}
                      className="bg-background/30 p-2 sm:p-4 rounded-lg"
                      variants={listItemVariants}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                    >
                      <h4 className="font-medium text-foreground mb-2">{item.term}</h4>
                      <p>{item.definition}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
              {/* Resumo Final */}
              {data.final_summary && (
                <motion.div
                  className="mt-6 sm:mt-8 bg-background/50 rounded-lg p-4 sm:p-6 backdrop-blur-sm"
                  initial={{ opacity: 0, y:10 }}
                  animate={{ opacity: 1, y:0 }}
                  transition={{ delay: data.objectives.length * 0.07 + 0.2 }} // Delay after objectives
                >
                  <h3 className="text-lg sm:text-xl font-semibold text-gold-400 mb-3 sm:mb-4">Resumo Final</h3>
                  <p className="text-foreground/70">{data.final_summary}</p>
                </motion.div>
              )}

              {/* Dicas de Estudo */}
              {data.study_tips.length > 0 && (
                <motion.div
                  className="mt-6 sm:mt-8 bg-background/50 rounded-lg p-4 sm:p-6 backdrop-blur-sm"
                  initial={{ opacity: 0, y:10 }}
                  animate={{ opacity: 1, y:0 }}
                  transition={{ delay: (data.objectives.length + data.glossary.length) * 0.07 + 0.3 }} // Delay after objectives and glossary
                >
                  <h3 className="text-lg sm:text-xl font-semibold text-gold-400 mb-3 sm:mb-4">Dicas de Estudo</h3>
                  <ul className="list-decimal list-inside space-y-2 text-foreground/70">
                    {data.study_tips.map((tip, index) => (
                      <motion.li
                        key={index}
                        variants={listItemVariants}
                        custom={index} // This index will be relative to the study_tips list
                        initial="hidden"
                        animate="visible"
                      >
                        {tip}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Controles de Navegação */}
              <div className="mt-6 sm:mt-8 flex justify-center sm:justify-between items-center flex-wrap gap-4">
                <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-center">
                  <PdfButton courseData={data} />
                  <button
                    onClick={() => setShowRating(true)}
                    // Applying base classes and then specific overrides for this button if needed.
                    // For consistency with global button styles, we'll use accent color.
                    // text-xs sm:text-base are font size overrides.
                    // Global styles provide padding, border-radius, text color, transitions.
                    // We just specify background and hover, and font size here.
                    className="text-xs sm:text-base"
                    // No need to add default button classes if it's a standard <button> element,
                    // as it will inherit from global styles.
                    // If we want to override specific parts like padding or radius for this one:
                    // className="px-3 py-1.5 text-xs sm:text-base rounded-md"
                    // This will use global accent for bg and white text.
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
