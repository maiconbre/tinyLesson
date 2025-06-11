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



  return (
    <motion.div className="mb-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      {/* Cabeçalho do Módulo */}
      <motion.button
        onClick={onSelect}
        className={`w-full flex items-center justify-between p-4 rounded-t-lg
                   transition-colors duration-300 group /* Keep CSS transition for colors */
                   ${isActive
            ? 'bg-teal-500/10 dark:bg-teal-400/10 border-l-4 border-teal-500 dark:border-teal-400 rounded-t-lg'
            : 'bg-neutral-100 dark:bg-dark-700 hover:bg-neutral-200 dark:hover:bg-dark-600 rounded-lg'
        } ${isActive && !showQuiz ? 'rounded-b-lg' : ''} ${isActive && showQuiz ? '' : 'rounded-b-lg'}`}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.15, ease: "easeOut" }} // For the tap scale effect
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-md ${isActive ? 'bg-teal-500/20 dark:bg-teal-400/20' : 'bg-neutral-200 dark:bg-dark-600'}`}>
            <BookOpenIcon className={`w-6 h-6 ${isActive ? 'text-teal-600 dark:text-teal-300' : 'text-neutral-700 dark:text-neutral-300'}`} />
          </div>
          <div className="text-left">
            <h3 className={`font-heading text-md md:text-lg ${isActive ? 'text-teal-700 dark:text-teal-300' : 'text-neutral-800 dark:text-neutral-200'}`}>
              {module.module_title}
            </h3>
          </div>
        </div>
        <ChevronDownIcon className={`w-5 h-5 transform transition-transform duration-300 ${isActive ? 'rotate-180 text-teal-600 dark:text-teal-300' : 'text-neutral-600 dark:text-neutral-400'}`} />
      </motion.button>

      {/* Conteúdo do Módulo */}
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, transition: { duration: 0.3, ease: "easeInOut" } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } }}
            className="overflow-hidden rounded-b-lg"
          >
            <div className="p-4 md:p-6 bg-neutral-50 dark:bg-dark-800 border-x-2 border-b-2 border-neutral-100 dark:border-dark-700 rounded-b-lg">
              {/* Introdução */}
              <motion.div
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3, delay:0.1 }}
                className="prose prose-sm sm:prose-base max-w-none mb-6 text-neutral-700 dark:text-neutral-300 font-sans"
              >
                <p>{module.introduction}</p>
              </motion.div>

              {/* Lista de Lições */}
              <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3, delay:0.2 }}>
                <h4 className="font-heading text-md md:text-lg text-teal-600 dark:text-teal-400 mb-3">Lições</h4>
                <div className="space-y-3 mb-6">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <motion.div
                      key={lessonIndex}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 + lessonIndex * 0.07 }}
                      className="p-3 md:p-4 bg-white dark:bg-dark-700/50 rounded-md shadow-sm hover:shadow-md transition-shadow duration-300
                              border-l-2 border-transparent hover:border-teal-500 dark:hover:border-teal-400"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-heading text-sm md:text-base text-neutral-800 dark:text-dark-50">{lesson.lesson_title}</h5>
                        <motion.button
                          onClick={() => onLessonComplete(lessonIndex)}
                          whileTap={{ scale: 0.95 }}
                          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-sans
                                    transition-colors duration-300 /* Keep CSS for colors */
                                    ${completedLessons.has(`${index}-${lessonIndex}`)
                                      ? 'bg-green-500/20 text-green-600 dark:bg-green-600/30 dark:text-green-400'
                                      : 'bg-neutral-200 dark:bg-dark-600 text-neutral-600 dark:text-neutral-300 hover:bg-teal-500/20 hover:text-teal-600 dark:hover:bg-teal-400/20 dark:hover:text-teal-400'
                                    }`}
                        >
                          <CheckCircleIcon className="w-4 h-4 md:w-5 md:h-5" />
                          <span className="hidden sm:inline">
                            {completedLessons.has(`${index}-${lessonIndex}`)
                              ? 'Concluída'
                              : 'Concluir'}
                          </span>
                        </motion.button>
                      </div>
                      <p className="font-sans text-xs md:text-sm text-neutral-600 dark:text-dark-200">{lesson.content}</p>
                      {lesson.example && (
                        <div className="mt-3 p-3 bg-neutral-100 dark:bg-dark-600/50 rounded-md">
                          <h6 className="font-sans text-xs md:text-sm font-semibold text-teal-600 dark:text-teal-400 mb-1">Exemplo:</h6>
                          <p className="font-sans text-xs md:text-sm text-neutral-600 dark:text-dark-200">{lesson.example}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Quiz */}
              <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3, delay:0.3 }}>
              <div className="mt-6">
                <button
                  onClick={() => setShowQuiz(!showQuiz)}
                  className="flex items-center justify-between space-x-2 font-heading text-md md:text-lg
                           p-3 md:p-4 rounded-md bg-neutral-100 dark:bg-dark-700 hover:bg-neutral-200 dark:hover:bg-dark-600
                           text-neutral-700 dark:text-neutral-200
                           transition-colors duration-300 w-full"
                >
                  <AcademicCapIcon className="w-6 h-6" />
                  <span>Quiz do Módulo</span>
                  <ChevronDownIcon
                    className={`w-5 h-5 transform transition-transform duration-300 ${showQuiz ? 'rotate-180' : 'rotate-0'}`}
                  />
                </button>

                <AnimatePresence>
                  {showQuiz && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-4">
                        {module.quiz.map((question, qIndex) => (
                          <div
                            key={qIndex}
                            className="p-3 md:p-4 bg-white dark:bg-dark-700/50 rounded-md shadow-sm"
                          >
                            <h6 className="font-sans text-sm md:text-base text-neutral-800 dark:text-dark-50 mb-3">
                              {qIndex + 1}. {question.question}
                            </h6>
                            <div className="space-y-2">
                              {question.options.map((option, optionIndex) => (
                                <button
                                  key={optionIndex}
                                  onClick={() => {
                                    setSelectedAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
                                    setShowExplanations(prev => ({ ...prev, [qIndex]: true }));
                                  }}
                                  disabled={showExplanations[qIndex]}
                                  className={`w-full p-3 rounded-md text-left transition-all duration-200 font-sans text-xs md:text-sm
                                            ${selectedAnswers[qIndex] === optionIndex
                                      ? question.answer === option
                                        ? 'bg-green-500/20 text-green-700 dark:bg-green-600/30 dark:text-green-300 ring-1 ring-green-500'
                                        : 'bg-red-500/20 text-red-700 dark:bg-red-600/30 dark:text-red-300 ring-1 ring-red-500'
                                      : `bg-neutral-100 dark:bg-dark-600 hover:bg-neutral-200 dark:hover:bg-dark-500 text-neutral-700 dark:text-neutral-300 ${showExplanations[qIndex] ? 'opacity-70' : ''}`
                                    }
                                            ${showExplanations[qIndex] && question.answer === option && selectedAnswers[qIndex] !== optionIndex
                                      ? 'ring-1 ring-green-500/70' // Highlight correct answer if user was wrong
                                      : ''
                                    }`}
                                >
                                  {String.fromCharCode(97 + optionIndex)}) {option}
                                </button>
                              ))}
                            </div>
                            {showExplanations[qIndex] && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-3 p-3 bg-neutral-100 dark:bg-dark-600/70 rounded-md"
                              >
                                <p className="font-sans text-xs md:text-sm text-neutral-700 dark:text-neutral-300">
                                  <span className={`font-semibold ${selectedAnswers[qIndex] === module.quiz[qIndex].options.indexOf(module.quiz[qIndex].answer) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {selectedAnswers[qIndex] === module.quiz[qIndex].options.indexOf(module.quiz[qIndex].answer) ? 'Correto! ' : 'Incorreto. '}
                                  </span>
                                  <span className="font-semibold text-teal-600 dark:text-teal-400">Explicação: </span>
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
