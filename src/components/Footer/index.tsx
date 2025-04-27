'use client';

import { useThemeStore } from '@/store/useThemeStore';

export const Footer = () => {
  const { theme } = useThemeStore();

  return (
    <footer className={`w-full py-3 sm:py-6 mt-auto border-t ${theme === 'dark' ? 'border-gray-800 bg-gray-900 text-gray-300' : 'border-gray-200 bg-[#FFB366] text-white'}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-2 md:mb-0">
            <p className="text-xs sm:text-sm">
              © 2025 Feito com ♥ por <a href="https://github.com/maiconbre" className="text-blue-500 underline hover:text-blue-700 transition-colors duration-200" target="_blank" rel="noopener noreferrer">Maicon B.</a> Todos os direitos reservados.
            </p>
          </div>
          <div className="flex space-x-2 sm:space-x-4">
            <a href="#" className="text-xs sm:text-sm text-blue-500 underline hover:text-blue-700 transition-colors duration-200">Termos de Uso</a>
            <a href="#" className="text-xs sm:text-sm text-blue-500 underline hover:text-blue-700 transition-colors duration-200">Política de Privacidade</a>
            <a href="#" className="text-xs sm:text-sm text-blue-500 underline hover:text-blue-700 transition-colors duration-200">Contato</a>
          </div>
        </div>
      </div>
    </footer>
  );
};