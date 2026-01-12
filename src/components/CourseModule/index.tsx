import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  BookOpen,
  Lightbulb,
  ChevronDown
} from 'lucide-react'; // Updated icons to lucide-react
import { Module } from '@/hooks/useMiniCourse';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; // Import Shadcn Accordion
import { Button } from "@/components/ui/button"; // Import Shadcn Button
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Import Shadcn Card

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

  // Determine the value for the Accordion based on isActive state
  const accordionValue = isActive ? `module-${index}` : undefined;

  return (
    <Accordion 
      type="single" 
      collapsible 
      value={accordionValue} 
      onValueChange={(value) => {
        // If the accordion is being opened/closed, call onSelect
        // This handles both clicking the trigger and programmatic changes if any
        if (value === `module-${index}` && !isActive) {
          onSelect(); // Open
        } else if (!value && isActive) {
          onSelect(); // Close
        }
      }}
      className="mb-4 w-full"
    >
      <AccordionItem value={`module-${index}`} className="border rounded-lg shadow-md bg-card">
        <AccordionTrigger 
          onClick={(e) => {
            // Prevent AccordionTrigger's default onClick from interfering if we manually call onSelect
            // e.preventDefault(); // This might be too aggressive, test behavior
            onSelect(); 
          }}
          className={`w-full flex items-center justify-between p-4 rounded-t-lg
                     transition-colors duration-300 group
                     ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'}`}
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isActive ? 'bg-primary/20' : 'bg-muted'}`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-base font-medium text-left">{module.module_title}</span>
          </div>
          {/* Chevron is part of AccordionTrigger by default */}
        </AccordionTrigger>
        <AccordionContent className="p-0">
          <div className="p-4 sm:p-6 border-t">
            {/* Introdução */}
            <Card className="mb-6 bg-background/70">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">{module.introduction}</p>
              </CardContent>
            </Card>

            {/* Lista de Lições */}
            <div className="space-y-4 mb-6">
              <h4 className="text-lg font-semibold text-primary mb-3">Lições</h4>
              {module.lessons.map((lesson, lessonIndex) => (
                <Card key={lessonIndex} className="bg-background/70">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-md font-medium">{lesson.lesson_title}</CardTitle>
                      <Button
                        variant={completedLessons.has(`${index}-${lessonIndex}`) ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => onLessonComplete(lessonIndex)}
                        className={`text-xs ${completedLessons.has(`${index}-${lessonIndex}`) ? 'bg-green-500/20 text-green-600 hover:bg-green-500/30' : 'hover:bg-primary/10'}`}
                      >
                        <CheckCircle className={`mr-1.5 h-3.5 w-3.5 ${completedLessons.has(`${index}-${lessonIndex}`) ? 'text-green-600' : ''}`} />
                        {completedLessons.has(`${index}-${lessonIndex}`) ? 'Concluída' : 'Concluir'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{lesson.content}</p>
                    {lesson.example && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-md">
                        <h6 className="text-xs font-semibold text-primary mb-1">Exemplo:</h6>
                        <p className="text-xs text-muted-foreground">{lesson.example}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quiz */}
            {module.quiz && module.quiz.length > 0 && (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="quiz" className="border-none">
                  <AccordionTrigger className="text-lg font-semibold text-primary hover:no-underline">
                    <div className="flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5" />
                      <span>Quiz do Módulo</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="space-y-4">
                      {module.quiz.map((question, qIndex) => (
                        <Card key={qIndex} className="bg-background/70">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-md font-medium">{question.question}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {question.options.map((option, optionIndex) => {
                              const isAnswered = showExplanations[qIndex];
                              const isSelectedByUser = selectedAnswers[qIndex] === optionIndex;
                              const isCorrectAnswer = question.answer === option;
                              let optionSpecificClass = 'hover:bg-muted/50'; // Default state before answering or for unselected incorrect answers

                              if (isAnswered) {
                                if (isCorrectAnswer) {
                                  optionSpecificClass = 'border bg-green-500/20 border-green-500 text-green-700 hover:bg-green-500/30'; // Correct answer
                                } else if (isSelectedByUser) {
                                  optionSpecificClass = 'border bg-red-500/20 border-red-500 text-red-700 hover:bg-red-500/30'; // Selected by user and incorrect
                                } else {
                                  // Incorrect option, not selected by user - remains 'hover:bg-muted/50'
                                  optionSpecificClass = 'hover:bg-muted/50 text-muted-foreground'; // Explicitly set for clarity, maybe slightly more muted
                                }
                              }

                              return (
                                <Button
                                  key={optionIndex}
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
                                    setShowExplanations(prev => ({ ...prev, [qIndex]: true }));
                                  }}
                                  disabled={showExplanations[qIndex]} // Options become disabled after an answer
                                  className={`w-full justify-start h-auto py-2 px-3 text-sm text-left ${optionSpecificClass}`}
                                >
                                  {option}
                                </Button>
                              );
                            })}
                            {showExplanations[qIndex] && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="mt-3 p-3 bg-muted/50 rounded-md text-sm"
                              >
                                <p className="text-muted-foreground">
                                  <span className="font-semibold text-primary">
                                    Explicação:{' '}
                                  </span>
                                  {question.explanation}
                                </p>
                              </motion.div>
                            )}
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
