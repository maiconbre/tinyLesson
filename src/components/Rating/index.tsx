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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.2, ease: "easeOut" } }}
      exit={{ opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }}
      className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1, transition: { duration: 0.25, ease: "easeOut" } }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2, ease: "easeIn" } }}
        className="bg-white dark:bg-dark-700 p-6 sm:p-8 rounded-xl shadow-2xl max-w-md w-full font-sans"
      >
        <AnimatePresence mode="wait">
          {!hasRated ? (
            <motion.div
              key="rating"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } }}
              exit={{ opacity: 0, x: 20, transition: { duration: 0.2, ease: "easeIn" } }}
              className="text-center"
            >
              <h2 className="font-heading text-xl sm:text-2xl text-neutral-800 dark:text-white mb-4">
                Como foi sua experiência?
              </h2>
              <p className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-base mb-6">
                Sua avaliação nos ajuda a melhorar o conteúdo para futuros estudantes.
              </p>
              <div className="flex justify-center space-x-1 sm:space-x-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => handleRate(star)}
                    className="p-1 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-teal-500/50 dark:focus:ring-teal-400/50"
                  >
                    {star <= (hover || rating) ? (
                      <StarSolid className="w-8 h-8 sm:w-10 sm:h-10 text-teal-500 dark:text-teal-400" />
                    ) : (
                      <StarOutline className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-300 dark:text-neutral-500" />
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-dark-600 hover:bg-neutral-200 dark:hover:bg-dark-500 rounded-lg transition-colors"
              >
                Avaliar depois
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="thanks"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-4"
            >
              <div className="flex justify-center mb-3 sm:mb-4">
                {[...Array(rating)].map((_, i) => (
                  <StarSolid key={i} className="w-6 h-6 sm:w-7 sm:h-7 text-teal-500 dark:text-teal-400" />
                ))}
              </div>
              <h3 className="font-heading text-lg sm:text-xl text-neutral-800 dark:text-white mb-3 sm:mb-4">
                Obrigado pelo feedback!
              </h3>
              <AnimatePresence>
                {showEmailField && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="space-y-3 sm:space-y-4 px-2"
                  >
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                      Quer receber atualizações? Deixe seu e-mail (opcional):
                    </p>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full px-3 py-2 text-sm font-sans rounded-md
                                 bg-neutral-100 dark:bg-dark-600 border border-neutral-300 dark:border-dark-500
                                 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500
                                 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-1 focus:ring-teal-500 dark:focus:ring-teal-400
                                 transition-colors duration-200"
                    />
                    {/* This button will inherit global styles */}
                    <button
                      onClick={() => {
                        onRate(rating, email); // Send email with rating
                        onClose(); // Close modal
                      }}
                      className="w-full text-sm py-2.5 px-4" // Uses global button styles from globals.css
                    >
                      Enviar Feedback
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* If email field is shown, the main close is handled by "Enviar Feedback" or a separate explicit close */}
              {!showEmailField && (
                 <button
                    onClick={onClose} // This button now closes the modal directly after "Obrigado" if email part is skipped
                    className="w-full py-2.5 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-dark-600 hover:bg-neutral-200 dark:hover:bg-dark-500 rounded-lg transition-colors mt-4"
                  >
                   Fechar
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
