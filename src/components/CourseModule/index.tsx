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
  isLocked: boolean;
  onModuleComplete: () => void;
  onQuestionComplete: (qIndex: number) => void; // New prop
}


export const CourseModule: React.FC<CourseModuleProps> = ({
  module,
  index,
  isActive,
  onSelect,
  completedLessons,
  onLessonComplete,
  isLocked,
  onModuleComplete,
  onQuestionComplete,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({});
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [currentQuestionIndexForPopup, setCurrentQuestionIndexForPopup] = useState<number | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [questionErrors, setQuestionErrors] = useState<Record<number, boolean>>({}); // Track if a question has been errored
  const [retryCounts, setRetryCounts] = useState<Record<number, number>>({}); // Track retries just in case

  const accordionValue = isActive ? `module-${index}` : undefined;

  // Check if all questions are answered correctly to unlock next module
  React.useEffect(() => {
    if (!module.quiz || module.quiz.length === 0) return;

    const totalQuestions = module.quiz.length;
    // Count correct answers based on selected options
    const correctCount = module.quiz.reduce((acc, question, qIndex) => {
      const selectedOptionIndex = selectedAnswers[qIndex];
      // Only count as correct if selected AND not revealed (cheated) - Unless user wants "colar" to unlock?
      // User said: "dinamica fluida e divertida incentivando estudos". Usually cheating allows progressing in casual apps.
      // I'll count it even if revealed to avoid blocking flow, or maybe require correct selection AFTER reveal.
      // Let's stick to: If the currently selected option is correct, it counts.
      if (selectedOptionIndex === undefined) return acc;

      const answerLetter = (question.answer || '').trim().toUpperCase();
      const correctIndex = answerLetter.length === 1
        ? answerLetter.charCodeAt(0) - 65
        : -1;

      const isCorrect = correctIndex === selectedOptionIndex || (question.answer === question.options[selectedOptionIndex]);
      return isCorrect ? acc + 1 : acc;
    }, 0);

    if (correctCount === totalQuestions) {
      onModuleComplete();
    }
  }, [selectedAnswers, module.quiz, onModuleComplete]);


  const handleOptionClick = (qIndex: number, optionIndex: number, question: any) => {
    // Determine correctness
    const answerLetter = (question.answer || '').trim().toUpperCase();
    const correctIndex = answerLetter.length === 1
      ? answerLetter.charCodeAt(0) - 65
      : -1;
    const isCorrect = correctIndex === optionIndex || (question.answer === question.options[optionIndex]);

    if (isCorrect) {
      setSelectedAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
      // Clear error state if it was there
      setQuestionErrors(prev => ({ ...prev, [qIndex]: false }));
      onQuestionComplete(qIndex); // Mark question as complete for global progress
    } else {
      // Wrong answer
      // Mark as selected (will show red)
      setSelectedAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
      // Mark as errored to show the buttons
      setQuestionErrors(prev => ({ ...prev, [qIndex]: true }));
    }
  };

  const openRevealPopup = (qIndex: number) => {
    setCurrentQuestionIndexForPopup(qIndex);
    setShowErrorPopup(true);
  };

  const handleRevealAnswer = () => {
    if (currentQuestionIndexForPopup !== null) {
      setRevealedAnswers(prev => ({ ...prev, [currentQuestionIndexForPopup]: true }));
      setShowExplanations(prev => ({ ...prev, [currentQuestionIndexForPopup]: true }));

      // Also auto-select the correct answer so verification passes?
      // Or user must click it? "Exibe resposta correta".
      // Let's select the correct answer automatically to be smooth
      const question = module.quiz[currentQuestionIndexForPopup];
      const answerLetter = (question.answer || '').trim().toUpperCase();
      const correctIndex = answerLetter.length === 1
        ? answerLetter.charCodeAt(0) - 65
        : -1;

      if (correctIndex !== -1) {
        setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndexForPopup]: correctIndex }));
      }

      setShowErrorPopup(false);
      // Remove error state for this question since we solved it
      setQuestionErrors(prev => ({ ...prev, [currentQuestionIndexForPopup]: false }));
      onQuestionComplete(currentQuestionIndexForPopup); // Mark question as complete for global progress (cheating counts!)
    }
  };

  const handleRetry = (qIndex: number) => {
    setSelectedAnswers(prev => {
      const next = { ...prev };
      delete next[qIndex];
      return next;
    });
    // Keep error state? User said "ao errar... botao sutil de tentar novamente".
    // Usually retry clears the selection.
    // We can keep the error state true until they get it right, OR clear it to reset the UI.
    // "abaixo da questao apos 1 erro é exibido botao... abaixo da ultima opçao".
    // If I clear selection, the buttons might disappear if they are condition on "error && !selected"?
    // Use case: User erred. Buttons appear. User clicks "Retry". Selection clears. 
    // Does user want buttons to persist? Probably not, they want to try again.
    // So reset everything for that question.
    setQuestionErrors(prev => ({ ...prev, [qIndex]: false }));
  };

  const handleStudy = () => {
    // Just close modal, let user read again
    setShowErrorPopup(false);
  }

  if (isLocked) {
    return (
      <div className="mb-4 w-full border rounded-lg shadow-sm bg-muted/20 opacity-70 relative">
        <div className="p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center text-lg sm:text-xl border border-border/50 grayscale">
              🔒
            </div>
            <span className="text-base sm:text-lg font-bold text-muted-foreground">
              {module.module_title}
            </span>
          </div>
          <span className="text-xs font-medium px-2 py-1 bg-muted text-muted-foreground rounded">Bloqueado</span>
        </div>
      </div>
    )
  }

  return (
    <>
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
                {index === 0 ? "🚀" : index === 1 ? "🧩" : index === 2 ? "🛠️" : index === 3 ? "📈" : "🏆"}
              </div>
              <span className="text-base sm:text-lg font-bold text-left flex-1 leading-tight">
                {module.module_title}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-0">
            <div className="p-4 sm:p-6 border-t bg-muted/30">

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
                      <Card className="border transition-all duration-300 bg-card hover:border-primary/30">
                        <CardHeader className="pb-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <CardTitle className="text-md sm:text-lg font-bold flex items-center gap-2">
                              <span className="text-primary/80">#{(lessonIndex + 1).toString().padStart(2, '0')}</span>
                              {lesson.lesson_title}
                            </CardTitle>
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
                                const isRevealed = revealedAnswers[qIndex];
                                const isSelectedByUser = selectedAnswers[qIndex] === optionIndex;

                                const answerLetter = (question.answer || '').trim().toUpperCase();
                                const correctIndex = answerLetter.length === 1
                                  ? answerLetter.charCodeAt(0) - 65
                                  : -1;
                                const isCorrectAnswer = correctIndex === optionIndex || (question.answer === option);

                                let optionSpecificClass = 'hover:bg-muted/50 border-input/60 border-primary/20 bg-background';
                                let icon = "⚪";

                                if (isSelectedByUser) {
                                  if (isCorrectAnswer) {
                                    optionSpecificClass = 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400';
                                    icon = "✅";
                                  } else {
                                    optionSpecificClass = 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400';
                                    icon = "❌";
                                  }
                                }

                                if (isRevealed && isCorrectAnswer) {
                                  optionSpecificClass = 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400';
                                  icon = "✅";
                                }


                                return (
                                  <Button
                                    key={optionIndex}
                                    variant="ghost"
                                    onClick={() => {
                                      if (!selectedAnswers[qIndex] && !isRevealed) {
                                        handleOptionClick(qIndex, optionIndex, question);
                                      }
                                    }}
                                    disabled={!!selectedAnswers[qIndex] || !!isRevealed}
                                    className={`w-full justify-start h-auto py-3 px-3 sm:px-4 text-sm text-left border rounded-xl transition-all duration-200 transform whitespace-normal break-words
                                             ${!selectedAnswers[qIndex] && !isRevealed && 'hover:scale-[1.01] hover:border-primary/30'}
                                             ${optionSpecificClass}`}
                                  >
                                    <span className="mr-3 text-base flex-shrink-0 mt-0.5">{icon}</span>
                                    <span className="flex-1 whitespace-normal leading-normal break-words">{option}</span>
                                  </Button>
                                );
                              })}

                              {/* Action Buttons on Error */}
                              <AnimatePresence>
                                {questionErrors[qIndex] && !revealedAnswers[qIndex] && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-between mt-3 pt-2 border-t border-border/30"
                                  >
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRetry(qIndex)}
                                      className="text-muted-foreground hover:text-primary text-xs flex items-center gap-1 h-8"
                                    >
                                      🔄 Tentar Novamente
                                    </Button>

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openRevealPopup(qIndex)}
                                      className="text-lg hover:bg-transparent hover:scale-110 transition-transform h-8 w-8 p-0"
                                      title="Ver Resposta"
                                    >
                                      👀
                                    </Button>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <AnimatePresence>
                                {(showExplanations[qIndex] || revealedAnswers[qIndex]) && (
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

      {/* Error Modal */}
      <AnimatePresence>
        {showErrorPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card border-none shadow-2xl p-6 rounded-2xl max-w-sm w-full text-center"
            >
              <div className="text-4xl mb-3">🤔</div>
              <h3 className="text-xl font-bold mb-2">Ops, Errar faz parte!</h3>
              <p className="text-muted-foreground text-sm mb-6">
                O erro é o melhor caminho para o aprendizado. Que tal reler o conteúdo com calma?
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Button onClick={handleStudy} className="w-full font-bold bg-purple-600 hover:bg-purple-700 text-white">
                  🎓 Estudar
                </Button>
                <Button onClick={handleRevealAnswer} className="w-full font-bold bg-orange-400 hover:bg-orange-500 text-white dark:bg-orange-500 dark:hover:bg-orange-600">
                  🤫 Colar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

