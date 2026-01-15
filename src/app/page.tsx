'use client';

import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { useMiniCourse } from '@/hooks/useMiniCourse';
import { CourseModule } from '@/components/CourseModule';
import { PdfButton } from '@/components/PdfGenerator';
import { Rating } from '@/components/Rating';
import { SearchInput } from '@/components/SearchInput';
import { useCourseStore } from '@/store/useCourseStore';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Sparkles, BookOpen, BadgeCheck } from "lucide-react";
import { GenerationLoader } from '@/components/GenerationLoader';

// Variantes de Animação
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100 }
  }
};

// Componente de Estrelas Otimizado (Hydration Safe - Ultra Slow)
const StarField = () => {
  const stars = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    top: `${(i * 19) % 100}%`,
    left: `${(i * 29) % 100}%`,
    size: (i % 5 === 0) ? 3 : 2,
    duration: `${25 + (i % 15)}s`,
    delay: `${(i * 3)}s`
  }));

  return (
    <div className="star-field">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            '--duration': star.duration,
            '--delay': star.delay,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default function Home() {
  const [theme, setTheme] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false); // State for completion modal
  const { data, loading, error, progress, generationProgress, actions } = useMiniCourse();
  const rateTheme = useCourseStore(state => state.rateTheme);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Calculate progress percentage based on QUIZ QUESTIONS
  const totalQuestions = data ? data.modules.reduce((acc, m) => acc + (m.quiz ? m.quiz.length : 0), 0) : 0;
  const completedQuestionsCount = progress.completedQuestions ? progress.completedQuestions.size : 0;
  const progressPercentage = totalQuestions > 0 ? (completedQuestionsCount / totalQuestions) * 100 : 0;

  const handleSubmit = () => {
    if (theme.trim()) {
      actions.generateCourse(theme);
    }
  };

  // Trigger Confetti & Modal on 100% Completion
  React.useEffect(() => {
    if (progressPercentage === 100 && totalQuestions > 0) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F97316', '#A855F7', '#FFD700'] // Orange, Purple, Gold
      });
      setTimeout(() => setShowCompletionModal(true), 1000); // Show modal after 1s
    }
  }, [progressPercentage, totalQuestions]);

  // Auto-scroll when data loads
  React.useEffect(() => {
    if (data && !loading && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [data, loading]);

  return (
    <div className="min-h-screen text-foreground transition-colors duration-300 relative overflow-x-hidden">

      {/* GLOBAL PROGRESS BAR (Fixed Top) */}
      {data && !loading && (
        <motion.div
          initial={{ y: -10 }}
          animate={{ y: 0 }}
          className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-2 shadow-sm"
        >
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <span className="text-xs font-bold text-muted-foreground whitespace-nowrap hidden sm:block">
              🚀 Progresso do Curso
            </span>
            <div className="flex-1 relative h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-purple-600"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: "circOut" }}
              />
            </div>
            <span className="text-xs font-bold text-primary whitespace-nowrap min-w-[3ch]">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </motion.div>
      )}

      {/* Container de Estrelas (Só aparece no Dark via CSS) */}
      <StarField />

      <main className="container mx-auto px-4 py-8 sm:py-12 md:py-20 relative z-10 mt-8"> {/* Added mt-8 for progress bar clearance */}

        {/* ... (Existing Hero & Search - Unchanged) ... */}
        {/* Header / Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>IA Generativa para Educação</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-orange-600 dark:text-purple-500 animate-fade-in">
            O Que Você Quer <br className="hidden sm:block" /> Aprender Hoje?
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Crie guias práticos e diretos ao ponto sobre qualquer assunto.<br />
            Sem enrolação, apenas o que você precisa saber.
          </p>
        </motion.div>

        {/* Área de Pesquisa */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <Card className="border-primary/20 shadow-2xl shadow-primary/5 bg-card/60 backdrop-blur-xl">
            <CardContent className="p-2 sm:p-4">
              <SearchInput
                value={theme}
                onChange={setTheme}
                onSubmit={handleSubmit}
                loading={loading}
                placeholder="Ex: Marketing Digital, Python, Nutrição..."
              />
            </CardContent>
          </Card>

          {/* Estado de Carregamento */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6"
              >
                <div className="w-full">
                  <GenerationLoader progress={generationProgress} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mensagem de Erro */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4"
              >
                <Alert variant="destructive" className="border-red-500/50 bg-red-500/10 text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-medium">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Conteúdo do Curso Gerado */}
        <div ref={resultsRef}>
          <AnimatePresence>
            {data && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="space-y-8 max-w-5xl mx-auto"
              >
                {/* ... (Existing Course Content render) ... */}

                {/* Título de Confirmação do Tema (logo abaixo do campo de pesquisa) */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-10 pb-6 border-b border-border/40"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-3 border border-green-500/20">
                    <BadgeCheck className="w-4 h-4" />
                    <span>Guia Completo Gerado</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-orange-600 dark:text-purple-400">
                    {data.title}
                  </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                  {/* MOBILE TOP: Objetivos e Glossário (Aparece antes dos módulos no Mobile) */}
                  <div className="md:hidden space-y-6">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                          🎯 Objetivos
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {data.objectives.map((obj, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex gap-2">
                              <span className="text-primary mt-1">🚀</span> {obj}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {data.glossary.length > 0 && (
                      <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            🧠 Glossário Vital
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {data.glossary.map((item, i) => (
                            <div key={i} className="text-sm border-b border-border/50 last:border-0 pb-2 last:pb-0">
                              <span className="font-bold text-foreground block">📌 {item.term}</span>
                              <span className="text-muted-foreground">{item.definition}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>


                  {/* Coluna Principal (Módulos) */}
                  <motion.div
                    className="md:col-span-2 space-y-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {data.modules.map((module, index) => (
                      <motion.div key={index} variants={itemVariants}>
                        <CourseModule
                          module={module}
                          index={index}
                          isActive={index === progress.currentModule}
                          onSelect={() => {
                            if (index <= progress.maxUnlockedModule) {
                              if (index === progress.currentModule) {
                                actions.goToModule(-1);
                              } else {
                                actions.goToModule(index);
                              }
                            }
                          }}
                          isLocked={index > progress.maxUnlockedModule}
                          onModuleComplete={() => actions.unlockNextModule(index)}
                          onQuestionComplete={(qIndex: number) => actions.markQuestionComplete(index, qIndex)}
                        />
                      </motion.div>
                    ))}

                    {/* Resumo Final */}
                    {data.final_summary && (
                      <motion.div variants={itemVariants}>
                        <Card className="border-primary/10 bg-gradient-to-br from-card to-primary/5">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl text-primary">
                              <BookOpen className="w-5 h-5" /> ✨ Conclusão Épica
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground leading-relaxed text-lg">{data.final_summary}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Sidebar (Desktop: Tudo / Mobile: Só Dicas e Ações no final) */}
                  <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    {/* Objetivos (Desktop Only) */}
                    <Card className="hidden md:block border-border/50 bg-card/50 backdrop-blur-sm sticky top-24 shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                          🎯 Objetivos
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {data.objectives.map((obj, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex gap-2">
                              <span className="text-primary mt-1">🚀</span> {obj}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Glossário (Desktop Only) */}
                    {data.glossary.length > 0 && (
                      <Card className="hidden md:block border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            🧠 Glossário Vital
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {data.glossary.map((item, i) => (
                            <div key={i} className="text-sm border-b border-border/50 last:border-0 pb-2 last:pb-0">
                              <span className="font-bold text-foreground block">📌 {item.term}</span>
                              <span className="text-muted-foreground">{item.definition}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* Dicas de Estudo (Visible on both, but flows to bottom on mobile) */}
                    {data.study_tips && data.study_tips.length > 0 && (
                      <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            💡 Dicas de Mestre
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {data.study_tips.map((tip, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex gap-2">
                                <span className="text-primary mt-1">⚡</span> {tip}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* Ações (Visible on both) */}
                    <div className="flex flex-col gap-3 pt-4">
                      <PdfButton courseData={data} />
                      <Button variant="outline" onClick={() => setShowRating(true)} className="w-full border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all duration-300">
                        ⭐ Avaliar Conteúdo
                      </Button>
                    </div>
                  </motion.div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

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

        {/* COMPLETION MODAL */}
        <AnimatePresence>
          {showCompletionModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20 }}
                className="bg-card border-2 border-primary/50 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center relative overflow-hidden"
              >
                {/* Background Glow */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-6xl mb-4"
                >
                  🏆
                </motion.div>

                <h2 className="text-3xl font-black text-primary mb-2">Curso Concluído!</h2>
                <p className="text-muted-foreground mb-6">
                  Parabéns! Você dominou o guia sobre <span className="text-foreground font-bold">{data?.title}</span>.
                </p>

                <div className="flex flex-col gap-3">
                  {data && <PdfButton courseData={data} />}
                  <Button
                    size="lg"
                    className="w-full font-bold text-lg animate-pulse hover:animate-none"
                    onClick={() => setShowCompletionModal(false)}
                  >
                    Continuar Aprendendo
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-16 py-6 border-t border-border/30">
          <div className="text-center text-xs text-muted-foreground">
            <p>
              © {new Date().getFullYear()} • Criado por{' '}
              <a
                href="https://www.targetweb.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors underline-offset-2 hover:underline"
              >
                Target Web
              </a>
            </p>
          </div>
        </footer>
      </main >
    </div >
  );
}
