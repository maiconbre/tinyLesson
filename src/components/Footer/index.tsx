'use client';

import { useThemeStore } from '@/store/useThemeStore';

export const Footer = () => {
  const { theme } = useThemeStore();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`w-full py-6 mt-auto border-t ${theme === 'dark' ? 'border-gray-800 bg-gray-900 text-gray-300' : 'border-gray-200 bg-[#FFB366] text-white'}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">
              © 2025 Feito com por Maicon B. Todos os direitos reservados.
            </p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-sm hover:underline transition-colors duration-200">
              Termos de Uso
            </a>
            <a href="#" className="text-sm hover:underline transition-colors duration-200">
              Política de Privacidade
            </a>
            <a href="#" className="text-sm hover:underline transition-colors duration-200">
              Contato
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};