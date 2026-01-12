import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClockIcon,Search, Loader2, Send } from 'lucide-react'; // Import Send and Loader2 from lucide-react
import { useCourseStore } from '@/store/useCourseStore';
import { Input } from '@/components/ui/input'; // Import Shadcn Input
import { Button } from '@/components/ui/button'; // Import Shadcn Button

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
  const inputRef = useRef<HTMLDivElement>(null); // Changed ref type to HTMLDivElement for the outer div
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { // Added type for event
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
    // Delay onSubmit to allow state update if needed, or call directly
    // For simplicity, calling directly here. Consider if a micro-delay is beneficial.
    onSubmit(); 
  };

  return (
    <div className="relative w-full" ref={inputRef}>
      <div className="relative flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Input // Use Shadcn Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Digite o tema ..."
            className="w-full text-base" // Adjusted classes for Shadcn Input
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            <Search className="h-5 w-5" />
          </div>
        </div>
        
        <Button // Use Shadcn Button
          onClick={onSubmit}
          disabled={!value.trim() || loading}
          className="w-full sm:w-auto text-base" // Adjusted classes for Shadcn Button
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Gerando...</span>
            </>
          ) : (
            <>
              <span>Gerar Mini Curso</span>
              <Send className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Sugestões de Temas Recentes */}
      <AnimatePresence>
        {showSuggestions && history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-2 py-2 bg-card border rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            <h3 className="px-4 py-2 text-sm font-medium text-primary">Temas Recentes</h3>
            <div>
              {history.map((theme, index) => (
                <Button // Can also use a simple button or a styled div if preferred
                  variant="ghost"
                  key={index}
                  onClick={() => handleSuggestionClick(theme)}
                  className="w-full px-3 sm:px-4 py-2 flex items-center space-x-2 sm:space-x-3 text-left justify-start h-auto text-sm sm:text-base"
                >
                  <ClockIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{theme}</span>
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
