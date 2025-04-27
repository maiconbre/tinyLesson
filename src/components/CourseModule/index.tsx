import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDownIcon,
  CheckCircleIcon,
  BookOpenIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { Module } from '@/hooks/useMiniCourse';

interface CourseModuleProps {
  module: Module;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  completedLessons: Set<string>;
  onLessonComplete: (lessonId: number) => void;
}

export const CourseModule: React.FC<CourseModuleProps> = ({
  module,
  index,
  isActive,
  onSelect,
  completedLessons,
  onLessonComplete,
}) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({});

  const allLessonsCompleted = module.lessons.every(
    (_, lessonIndex) => completedLessons.has(`${index}-${lessonIndex}`)
  );

  const moduleProgress = Math.round(
    (Array.from(completedLessons).filter(id => id.startsWith(`${index}-`)).length /
      module.lessons.length) *
      100
  );

  return (
    <div className="mb-4">
      {/* Cabeçalho do Módulo */}
      <button
        onClick={onSelect}
        className={`w-full flex items-center justify-between p-4 rounded-lg
                   transition-all duration-300 group shadow-lg hover:shadow-xl
                   transform hover:scale-105
                   ${isActive
            ? 'bg-gold-500/20 text-gold-400 dark:bg-dark-700 dark:text-gold-400 border-l-4 border-gold-400'
            : 'bg-background/50 text-foreground/80 hover:bg-background/80 dark:bg-dark-800/50 dark:text-foreground/80 dark:hover:bg-dark-800/80'}`}
      >
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-lg ${isActive ? 'bg-gold-500/20' : 'bg-dark-700 dark:bg-dark-700'}`}>
            <BookOpenIcon className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="text-xs md:text-sm text-foreground/70">{module.module_title}</p>
          </div>
        </div>
      </button>

      {/* Conteúdo do Módulo */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 bg-background/50 rounded-b-lg mt-1 backdrop-blur-sm dark:bg-dark-800/50">
              {/* Introdução */}
              <div className="prose prose-invert prose-gold max-w-none mb-8 text-foreground/70">
                <p>{module.introduction}</p>
              </div>

              {/* Lista de Lições */}
              <div className="space-y-4 mb-8">
                <h4 className="text-sm md:text-lg font-medium text-gold-400 mb-4">Lições</h4>
                {module.lessons.map((lesson, lessonIndex) => (
                  <div
                    key={lessonIndex}
                    className="p-4 bg-background/30 rounded-lg hover:bg-background/50 
                             transition-all duration-300
                             hover:shadow-lg dark:bg-dark-800/80 dark:hover:bg-dark-800
                             border-l-2 border-transparent hover:border-gold-400"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-foreground text-sm md:text-lg hover:text-gold-400 transition-colors">{lesson.lesson_title}</h5>
                      <button
                        onClick={() => onLessonComplete(lessonIndex)}
                        className={`flex items-center space-x-2 px-2 py-2 rounded-full text-xs md:text-lg
                                  transition-all duration-300 hover:bg-opacity-80
                                  ${
                                    completedLessons.has(`${index}-${lessonIndex}`)
                                      ? 'bg-green-500/20 text-green-400'
                                      : 'bg-dark-700 text-gold-300 hover:bg-dark-600 dark:bg-dark-700 dark:text-gold-300 dark:hover:bg-dark-600'
                                  }`}
                      >
                        <CheckCircleIcon className="w-1 h-1" />
                        <span>
                          {completedLessons.has(`${index}-${lessonIndex}`)
                            ? 'Concluída'
                            : 'Marcar como concluída'}
                        </span>
                      </button>
                    </div>
                    <p className="text-foreground/70">{lesson.content}</p>
                    {lesson.example && (
                      <div className="mt-4 p-4 bg-background/50 rounded-lg dark:bg-dark-900/50">
                        <h6 className="text-sm font-medium text-gold-400 mb-2">Exemplo:</h6>
                        <p className="text-foreground/70">{lesson.example}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Quiz */}
              <div className="mt-8">
                <button
                  onClick={() => setShowQuiz(!showQuiz)}
                  className="flex items-center space-x-2 text-sm md:text-lg font-medium text-gold-400 
                           p-4 rounded-lg bg-background/30 hover:bg-background/50 
                           transition-all duration-300 hover:bg-opacity-80
                           dark:bg-dark-800/80 dark:hover:bg-dark-800 w-full"
                >
                  <AcademicCapIcon className="w-6 h-6" />
                  <span>Quiz do Módulo</span>
                  <ChevronDownIcon
                    className={`w-5 h-5 transform transition-transform duration-300
                             ${showQuiz ? 'rotate-180' : 'rotate-0'}`}
                  />
                </button>

                <AnimatePresence>
                  {showQuiz && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-6">
                        {module.quiz.map((question, qIndex) => (
                          <div
                            key={qIndex}
                            className="p-4 bg-background/30 rounded-lg dark:bg-dark-800/80
                                     transition-colors duration-300
                                     hover:bg-background/50 dark:hover:bg-dark-700"
                          >
                            <h6 className="text-sm md:text-lg text-foreground mb-4">
                              {question.question}
                            </h6>
                            <div className="space-y-2 text-sm md:text-lg">
                              {question.options.map((option, optionIndex) => (
                                <button
                                  key={optionIndex}
                                  onClick={() => {
                                    setSelectedAnswers(prev => ({
                                      ...prev,
                                      [qIndex]: optionIndex
                                    }));
                                    setShowExplanations(prev => ({
                                      ...prev,
                                      [qIndex]: true
                                    }));
                                  }}
                                  disabled={showExplanations[qIndex]}
                                  className={`w-full p-4 rounded-lg text-left transition-all
                                            duration-300 hover:bg-opacity-80
                                            ${
                                              selectedAnswers[qIndex] === optionIndex
                                                ? question.answer === option
                                                  ? 'bg-green-500/20 text-green-400'
                                                  : 'bg-red-500/20 text-red-400'
                                                : 'bg-dark-700 hover:bg-dark-600 text-gold-300 dark:bg-dark-700 dark:hover:bg-dark-600 dark:text-gold-300'
                                            }
                                            ${
                                              showExplanations[qIndex] &&
                                              question.answer === option
                                                ? 'ring-2 ring-green-500/50'
                                                : ''
                                            }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                            {showExplanations[qIndex] && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-4 bg-background/50 rounded-lg dark:bg-dark-900/50"
                              >
                                <p className="text-foreground/70">
                                  <span className="font-medium text-gold-400">
                                    Explicação:{' '}
                                  </span>
                                  {question.explanation}
                                </p>
                              </motion.div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
