import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClockIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useCourseStore } from '@/store/useCourseStore';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onSubmit,
  loading = false,
}) => {
  const [, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const history = useCourseStore(state => state.history);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Previne o comportamento padrão do Enter
      if (value.trim()) {
        onSubmit();
        setShowSuggestions(false);
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    onSubmit();
  };

  return (
    <div className="relative w-full" ref={inputRef}>
      <div className="relative flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Digite o tema ..."
          className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-background border-2 border-foreground/30 rounded-xl
                   text-foreground placeholder-foreground/50 text-sm sm:text-base
                   focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20
                   transition-all duration-300"
        />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-foreground/50">
          <MagnifyingGlassIcon className="h-5 w-5" />
        </div>
      </div>
      
      <button
        onClick={onSubmit}
        disabled={!value.trim() || loading}
        className="w-full sm:w-auto px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-gold-600 to-gold-500 rounded-xl
                   text-dark-900 font-semibold text-sm sm:text-base
                   hover:from-gold-500 hover:to-gold-400
                   transform hover:scale-[1.02] transition-all duration-300
                   focus:outline-none focus:ring-2 focus:ring-gold-500/50
                   disabled:opacity-50 disabled:cursor-not-allowed
                   disabled:hover:scale-100
                   flex items-center justify-center gap-2 sm:gap-3"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-dark-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Gerando...</span>
          </>
        ) : (
          <>
            <span>Gerar Mini Curso</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </>
        )}
      </button>
    </div>

    {/* Sugestões de Temas Recentes */}
    <AnimatePresence>
      {showSuggestions && history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute z-10 w-full mt-2 py-2 bg-background border border-foreground/30 rounded-lg shadow-xl max-h-60 overflow-y-auto"
        >
          <h3 className="px-4 py-2 text-sm font-medium text-gold-400">Temas Recentes</h3>
          <div>
            {history.map((theme, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(theme)}
                className="w-full px-3 sm:px-4 py-2 flex items-center space-x-2 sm:space-x-3 text-left hover:bg-background/80 transition-colors text-foreground text-sm sm:text-base"
              >
                <ClockIcon className="h-4 w-4 text-gold-500/50" />
                <span>{theme}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
  );
};
