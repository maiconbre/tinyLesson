import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { PdfButton } from '@/components/PdfGenerator';
import { MiniCourse } from '@/hooks/useMiniCourse'; // Adjust import if needed based on structure

interface CompletionModalProps {
    show: boolean;
    onClose: () => void;
    data: MiniCourse | null;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({ show, onClose, data }) => {
    return (
        <AnimatePresence>
            {show && (
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
                                onClick={onClose}
                            >
                                Continuar Aprendendo
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
