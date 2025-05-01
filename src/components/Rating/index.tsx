import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

interface RatingProps {
  onRate: (score: number, email?: string) => void;
  onClose: () => void;
}

export const Rating: React.FC<RatingProps> = ({ onRate, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [showEmailField, setShowEmailField] = useState(false);
  const [email, setEmail] = useState('');

  const handleRate = (score: number) => {
    setRating(score);
    setHasRated(true);
    onRate(score);
    setShowEmailField(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 flex items-center justify-center bg-dark-900/80 backdrop-blur-sm z-50 dark:bg-dark-900/90"
    >
      <div className="bg-background p-8 rounded-2xl shadow-xl max-w-md w-full mx-4 dark:bg-dark-800">
        <AnimatePresence mode="wait">
          {!hasRated ? (
            <motion.div
              key="rating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold text-gold-400 mb-6">
                Como foi sua experiência?
              </h2>
              <p className="text-foreground/70 mb-8">
                Sua avaliação nos ajuda a melhorar o conteúdo para futuros estudantes.
              </p>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => handleRate(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    {star <= (hover || rating) ? (
                      <StarSolid className="w-10 h-10 text-gold-500" />
                    ) : (
                      <StarOutline className="w-10 h-10 text-gold-500/50" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="thanks"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-4"
            >
              <div className="flex justify-center mb-4">
                {[...Array(rating)].map((_, i) => (
                  <StarSolid key={i} className="w-6 h-6 sm:w-8 sm:h-8 text-gold-500" />
                ))}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gold-400 mb-4">
                Obrigado pelo feedback!
              </h3>
              <AnimatePresence>
                {showEmailField && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="space-y-4 px-2"
                  >
                    <p className="text-sm text-foreground/70">
                      Quer receber atualizações? Deixe seu e-mail:
                    </p>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full px-3 py-2 text-sm bg-background/50 rounded-lg border border-foreground/30"
                    />
                    <button
                      onClick={() => {
                        onRate(rating, email);
                        onClose();
                      }}
                      className="w-full py-2 text-sm bg-gold-500/20 text-gold-400 rounded-lg hover:bg-gold-500/30"
                    >
                      Enviar
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {!hasRated && (
          <button
            onClick={onClose}
            className="mt-8 text-gold-400/60 hover:text-gold-400 text-sm font-medium"
          >
            Avaliar depois
          </button>
        )}
      </div>
    </motion.div>
  );
};
