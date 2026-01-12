import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import {
//   CheckCircle,
//   BookOpen,
//   Lightbulb,
// } from 'lucide-react'; // Removing unused imports to satisfy linter
// Lucide icons removed


import { Module } from '@/hooks/useMiniCourse';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Variants for list items

// Variants for list items
const listItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 12 }
  }
};

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
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({});

  const accordionValue = isActive ? `module-${index}` : undefined;

  return (
    <Accordion
      type="single"
      collapsible
      value={accordionValue}
      onValueChange={(value) => {
        if (value === `module-${index}` && !isActive) {
          onSelect();
        } else if (!value && isActive) {
          onSelect();
        }
      }}
      className="mb-4 w-full"
    >
      <AccordionItem value={`module-${index}`} className="border rounded-lg shadow-md bg-card group-data-[state=open]:shadow-xl transition-all duration-300">
        <AccordionTrigger
          onClick={() => onSelect()}
          className={`w-full flex items-center justify-between p-4 sm:p-5 rounded-t-lg
                     transition-all duration-300 group hover:no-underline hover:brightness-105
                     ${isActive ? 'bg-primary/10 text-primary shadow-sm' : 'hover:bg-muted/50'}`}
        >
          <div className="flex items-center space-x-3 w-full">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background flex items-center justify-center text-lg sm:text-xl shadow-sm border border-border/50">
              {/* Dynamically assign emoji based on index or just generic */}
              {index === 0 ? "🚀" : index === 1 ? "🧩" : index === 2 ? "🛠️" : index === 3 ? "📈" : "🏆"}
            </div>
            <span className="text-base sm:text-lg font-bold text-left flex-1 leading-tight">
              {module.module_title}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="p-0">
          <div className="p-4 sm:p-6 border-t bg-muted/30"> {/* Lighter background for content area */}

            {/* Introdução with subtle fade in */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="mb-6 bg-card border-none shadow-sm">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground leading-relaxed flex gap-3">
                    <span className="text-2xl select-none">👋</span>
                    <span className="pt-1">{module.introduction}</span>
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Lista de Lições */}
            <div className="space-y-4 mb-8">
              <h4 className="text-lg font-black text-primary mb-4 flex items-center gap-2">
                <span>📚</span>Conteúdo Vital
              </h4>
              <motion.div
                className="space-y-4"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              >
                {module.lessons.map((lesson, lessonIndex) => (
                  <motion.div key={lessonIndex} variants={listItemVariants}>
                    <Card className={`
                        border transition-all duration-300
                        ${completedLessons.has(`${index}-${lessonIndex}`)
                        ? 'border-green-500/30 bg-green-500/5'
                        : 'bg-card hover:border-primary/30'}
                    `}>
                      <CardHeader className="pb-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <CardTitle className="text-md sm:text-lg font-bold flex items-center gap-2">
                            <span className="text-primary/80">#{(lessonIndex + 1).toString().padStart(2, '0')}</span>
                            {lesson.lesson_title}
                          </CardTitle>
                          <Button
                            variant={completedLessons.has(`${index}-${lessonIndex}`) ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => onLessonComplete(lessonIndex)}
                            className={`w-full sm:w-auto text-xs sm:text-sm font-medium transition-all duration-300
                                ${completedLessons.has(`${index}-${lessonIndex}`)
                                ? 'bg-green-500/20 text-green-700 hover:bg-green-500/30 ring-1 ring-green-500/50'
                                : 'hover:bg-primary/5 hover:text-primary hover:border-primary/30'}`}
                          >
                            {completedLessons.has(`${index}-${lessonIndex}`) ? (
                              <>✅ Concluída</>
                            ) : (
                              <>◯ Marcar Conclusão</>
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm sm:text-base text-muted-foreground mb-4 leading-relaxed">
                          {lesson.content}
                        </p>
                        {lesson.example && (
                          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400/50" />
                            <h6 className="text-xs font-bold text-yellow-600 dark:text-yellow-400 mb-2 uppercase tracking-wide flex items-center gap-1">
                              💡 Exemplo Prático
                            </h6>
                            <p className="text-sm italic text-muted-foreground/90">{lesson.example}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Quiz Section with improved styling */}
            {module.quiz && module.quiz.length > 0 && (
              <Accordion type="single" collapsible className="w-full mt-8">
                <AccordionItem value="quiz" className="border-none bg-gradient-to-r from-primary/5 to-transparent rounded-xl">
                  <AccordionTrigger className="px-4 py-3 text-lg font-bold text-primary hover:no-underline group">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-background rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                        🧠
                      </div>
                      <span className="text-left">Desafio Relâmpago (Quiz)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-3 sm:p-4 pt-0">
                    <div className="space-y-6 mt-4">
                      {module.quiz.map((question, qIndex) => (
                        <Card key={qIndex} className="bg-card/80 border-primary/10 shadow-sm overflow-hidden">
                          {/* ... (Existing Quiz render logic, just ensuring styles are kept) ... */}
                          <CardHeader className="pb-2 p-3 sm:p-6">
                            <div className="flex gap-3 items-start">
                              <span className="text-2xl mt-1 flex-shrink-0">❓</span>
                              <CardTitle className="text-base sm:text-lg font-medium leading-snug pt-1 whitespace-normal break-words">
                                {question.question}
                              </CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2 pl-2 sm:pl-12 pr-2 sm:pr-6 pb-4">
                            {question.options.map((option, optionIndex) => {
                              const isAnswered = showExplanations[qIndex];
                              const isSelectedByUser = selectedAnswers[qIndex] === optionIndex;

                              // Logic already fixed in previous turn, keeping it safe
                              const answerLetter = (question.answer || '').trim().toUpperCase();
                              const correctIndex = answerLetter.length === 1
                                ? answerLetter.charCodeAt(0) - 65
                                : -1;
                              const isCorrectAnswer = correctIndex === optionIndex || (question.answer === option);

                              let optionSpecificClass = 'hover:bg-muted/50 border-input bg-background';
                              let icon = "⚪";

                              if (isAnswered) {
                                if (isCorrectAnswer) {
                                  optionSpecificClass = 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400';
                                  icon = "✅";
                                } else if (isSelectedByUser) {
                                  optionSpecificClass = 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400';
                                  icon = "❌";
                                } else {
                                  optionSpecificClass = 'opacity-50 grayscale';
                                }
                              }

                              return (
                                <Button
                                  key={optionIndex}
                                  variant="ghost"
                                  onClick={() => {
                                    if (!isAnswered) {
                                      setSelectedAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
                                      setShowExplanations(prev => ({ ...prev, [qIndex]: true }));
                                    }
                                  }}
                                  disabled={!!isAnswered}
                                  className={`w-full justify-start h-auto py-3 px-3 sm:px-4 text-sm text-left border rounded-xl transition-all duration-200 transform whitespace-normal break-words
                                             ${!isAnswered && 'hover:scale-[1.01] hover:border-primary/30'}
                                             ${optionSpecificClass}`}
                                >
                                  <span className="mr-3 text-base flex-shrink-0 mt-0.5">{icon}</span>
                                  <span className="flex-1 whitespace-normal leading-normal break-words">{option}</span>
                                </Button>
                              );
                            })}

                            <AnimatePresence>
                              {showExplanations[qIndex] && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm whitespace-normal break-words">
                                    <p className="text-foreground/90 leading-relaxed">
                                      <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">
                                        ℹ️ Explicação (Resposta {question.answer}):
                                      </span>
                                      {question.explanation}
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
