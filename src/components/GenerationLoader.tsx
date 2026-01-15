import React from 'react';
import { Brain } from 'lucide-react';

interface GenerationLoaderProps {
    progress: number;
}

export const GenerationLoader: React.FC<GenerationLoaderProps> = ({ progress }) => {
    const getPhaseText = (p: number) => {
        if (p < 20) return "Conectando...";
        if (p < 45) return "Analisando tema...";
        if (p < 70) return "Estruturando módulos...";
        if (p < 85) return "Escrevendo conteúdo...";
        if (p < 95) return "Refinando detalhes...";
        return "Finalizando...";
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto">
            {/* Brain Icon Container */}
            <div className="relative w-24 h-24 mb-4">
                {/* Simple rotating ring */}
                <div
                    className="absolute inset-0 rounded-full border-2 border-primary/30"
                    style={{
                        animation: 'spin 8s linear infinite',
                        borderTopColor: 'transparent'
                    }}
                />

                {/* Brain Icon with Fill Effect */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-16 h-16">
                        {/* Background brain (gray) */}
                        <Brain className="w-full h-full text-muted-foreground/30 absolute" strokeWidth={1.5} />

                        {/* Filling brain (colored, clipped) */}
                        <div
                            className="absolute inset-0 overflow-hidden"
                            style={{
                                clipPath: `inset(${100 - progress}% 0 0 0)`,
                                transition: 'clip-path 0.3s ease-out'
                            }}
                        >
                            <Brain className="w-full h-full text-primary" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

                {/* Percentage */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-foreground mt-16">{Math.round(progress)}%</span>
                </div>
            </div>

            {/* Status Text */}
            <p className="text-sm font-medium text-muted-foreground text-center">
                {getPhaseText(progress)}
            </p>

            {/* Simple dots */}
            <div className="flex gap-1 mt-2">
                <div className="w-1 h-1 rounded-full bg-primary/50 animate-pulse" />
                <div className="w-1 h-1 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-1 h-1 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
        </div>
    );
};
