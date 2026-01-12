'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMiniCourse } from '@/hooks/useMiniCourse';
import { CourseModule } from '@/components/CourseModule';
import { PdfButton } from '@/components/PdfGenerator';
import { Rating } from '@/components/Rating';
import { SearchInput } from '@/components/SearchInput';
import { useCourseStore } from '@/store/useCourseStore';
import { Progress } from "@/components/ui/progress"; // Import Progress component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Import Shadcn Card
import { Button } from "@/components/ui/button"; // Import Shadcn Button
import { Alert, AlertDescription } from "@/components/ui/alert"; // Import Shadcn Alert
import { AlertCircle } from "lucide-react"; // Import icon for Alert

// Renamed function to GeneratePage
export default function GeneratePage() {
  const [theme, setTheme] = useState('');
  const [showRating, setShowRating] = useState(false);
  // Assuming generationProgress (0-100) might be provided by useMiniCourse for loading state
  const { data, loading, error, progress, generationProgress, actions } = useMiniCourse();
  const rateTheme = useCourseStore(state => state.rateTheme);

  const handleSubmit = () => {
    if (theme.trim()) {
      actions.generateCourse(theme);
    }
  };

  return (
    // Removed min-h-screen and bg-background as they are handled by layout
    <div className="text-foreground transition-colors duration-300 overflow-x-hidden relative">
      {/* Animated Background Element - Specific for generate page */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-radial from-gold-400/50 via-gold-400/10 to-transparent animate-pulse-gradient-bg"
        style={{ backgroundPosition: 'center center' }}
      />
      <div className="relative z-10">
        {/* Header - Aligned Left */}
        <header className="pt-12 sm:pt-16 md:pt-20 pb-6 sm:pb-16 px-4 sm:px-6">
          <motion.div
            className="max-w-5xl mx-auto text-left" // Use consistent max-width and align left
          >
            <h1 className="text-3xl md:text-5xl font-bold text-primary mb-3 sm:mb-4">
               Gerador de Mini Cursos
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Insira um tema e gere um mini curso estruturado em segundos. Ideal para estudos rápidos.
            </p>
          </motion.div>
        </header>

        {/* Form Section */}
        <section className="px-4 sm:px-6 mb-12 sm:mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-5xl mx-auto" // Use consistent max-width
          >
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <SearchInput
                  value={theme}
                  onChange={setTheme}
                  onSubmit={handleSubmit}
                  loading={loading}
                />
              </CardContent>
            </Card>

            {/* Loading State with Progress Bar */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 max-w-md mx-auto"
              >
                <Progress value={generationProgress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Gerando curso... {typeof generationProgress === 'number' ? `${generationProgress}%` : 'Por favor, aguarde.'}
                </p>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
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
            <Card className="max-w-5xl mx-auto bg-card/80 backdrop-blur-sm mb-8">
              <CardHeader>
                <CardTitle className="text-3xl sm:text-4xl font-bold text-primary text-center">
                  {data.title}
                </CardTitle>
              </CardHeader>
            </Card>
            
            <div className="max-w-5xl mx-auto space-y-8"> {/* Added space-y for consistent spacing */}
              {/* Objetivos - Card Style */}
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl font-semibold text-primary">Objetivos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    {data.objectives.map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

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

              {/* Glossário - Card Style */}
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl font-semibold text-primary">Glossário</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-muted-foreground">
                    {data.glossary.map((item, index) => (
                      <div key={index} className="p-2 rounded-md bg-background/50">
                        <h4 className="font-medium text-foreground mb-1">{item.term}</h4>
                        <p className="text-sm">{item.definition}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Resumo Final - Card Style */}
              {data.final_summary && (
                <Card className="bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl font-semibold text-primary">Resumo Final</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{data.final_summary}</p>
                  </CardContent>
                </Card>
              )}

              {/* Dicas de Estudo - Card Style */}
              {data.study_tips.length > 0 && (
                <Card className="bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl font-semibold text-primary">Dicas de Estudo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
                      {data.study_tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Controles de Navegação - Adjusted margin top */}
              <div className="mt-8 flex justify-center items-center flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <PdfButton courseData={data} />
                  <Button
                    onClick={() => setShowRating(true)}
                    variant="secondary" // Using a Shadcn variant
                    size="sm" // Consistent sizing
                  >
                    Avaliar Curso
                  </Button>
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
    </div> // Changed main to div
  );
}
