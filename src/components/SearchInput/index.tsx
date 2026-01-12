import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Search, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { useCourseStore } from '@/store/useCourseStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onSubmit,
  loading = false,
  placeholder = "Sobre o que você quer aprender?"
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (value.trim()) {
        onSubmit();
        setShowSuggestions(false);
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    setTimeout(() => onSubmit(), 50);
  };

  // Simplificando: Container Único Menor
  // Removemos o wrapper extra. Agora este é o container principal da barra.
  const containerClasses = cn(
    "relative flex items-center w-full max-w-2xl mx-auto rounded-full transition-all duration-300", // Max-w-2xl para ser "menor"
    "bg-white dark:bg-zinc-950",
    "border-2 p-1.5", // Padding interno cria espaço para o botão
    isFocused
      ? "border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)] dark:border-purple-500 dark:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
      : "border-gray-200 dark:border-zinc-800 hover:border-orange-300 dark:hover:border-purple-700"
  );

  const inputClasses = "flex-1 bg-transparent border-none outline-none text-base md:text-lg h-10 w-full ml-2 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600";

  const iconClasses = cn(
    "w-5 h-5 ml-4 transition-colors duration-300",
    isFocused ? "text-orange-500 dark:text-purple-500" : "text-gray-400 dark:text-gray-600"
  );

  const buttonClasses = cn(
    "rounded-full h-10 px-6 font-bold transition-all duration-300 relative overflow-hidden text-white flex-shrink-0",
    // Gradiente Laranja (Light) vs Roxo (Dark)
    "bg-gradient-to-r from-orange-500 to-amber-500 dark:from-purple-600 dark:to-indigo-600",
    "hover:from-orange-600 hover:to-amber-600 dark:hover:from-purple-500 dark:hover:to-indigo-500",
    "shadow-md shadow-orange-500/20 dark:shadow-purple-500/30",
    "hover:scale-[1.05] active:scale-[0.95]",
    loading && "opacity-80 cursor-wait"
  );

  return (
    <div className="relative w-full" ref={inputRef}>

      {/* Barra de Pesquisa Compacta */}
      <div className={containerClasses}>
        <Search className={iconClasses} />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={inputClasses}
          autoComplete="off"
        />

        <Button
          onClick={onSubmit}
          disabled={!value.trim() || loading}
          size="sm"
          className={buttonClasses}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
              <span>Gerar</span>
              <Sparkles className="w-4 h-4 fill-current animate-pulse" />
            </div>
          )}
        </Button>
      </div>

      {/* Sugestões Dropdown (Ajustado para o novo tamanho) */}
      <AnimatePresence>
        {showSuggestions && history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-1/2 -translate-x-1/2 w-full max-w-2xl mt-2 p-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-3 h-3" />
              Recentes
            </div>

            <div className="space-y-1">
              {history.slice(0, 5).map((theme, index) => (
                <motion.button
                  key={index}
                  whileHover={{ x: 4 }}
                  onClick={() => handleSuggestionClick(theme)}
                  className="w-full text-left px-3 py-3 rounded-lg flex items-center justify-between group transition-all hover:bg-orange-50 dark:hover:bg-purple-900/20"
                >
                  <span className="text-gray-700 dark:text-gray-200 font-medium truncate">{theme}</span>
                  <ArrowRight className="w-4 h-4 text-orange-500 dark:text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
