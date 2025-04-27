'use client';

import React, { useState } from 'react';
import { generateEbook } from '@/services/api';
import { HiLightBulb, HiUsers, HiBookOpen, HiPencil } from 'react-icons/hi';
import { Tooltip } from 'react-tooltip';

interface FormProps {
  onSuccess: (data: void) => void;
  onError: (message: string) => void;
  onLoading: (isLoading: boolean) => void;
}

const EbookForm: React.FC<FormProps> = ({ onSuccess, onError, onLoading }) => {
  const [tema, setTema] = useState('');
  const [publicoAlvo, setPublicoAlvo] = useState('');
  const [numCapitulos, setNumCapitulos] = useState(3);
  const [estiloEscrita, setEstiloEscrita] = useState('formal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formProgress, setFormProgress] = useState(0);

  React.useEffect(() => {
    // Calcula o progresso do formulário
    let progress = 0;
    if (tema) progress += 25;
    if (publicoAlvo) progress += 25;
    if (numCapitulos) progress += 25;
    if (estiloEscrita) progress += 25;
    setFormProgress(progress);
  }, [tema, publicoAlvo, numCapitulos, estiloEscrita]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onLoading(true);
    onError('');

    if (!tema || !publicoAlvo) {
      onError('Os campos Tema e Público-Alvo são obrigatórios.');
      onLoading(false);
      setIsSubmitting(false);
      return;
    }

    try {
      const data = { tema, publicoAlvo, numCapitulos, estiloEscrita };
      const result = await generateEbook(data);
      onSuccess(result);
    } catch (error: unknown) {
      onError(error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.');
    } finally {
      onLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      {/* Barra de Progresso Avançada */}
      <div className="mb-8 relative">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-primary-600 font-medium">Progresso</span>
          <span className="text-primary-600 font-medium">{formProgress}%</span>
        </div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 p-0.5 overflow-hidden relative">
          <div 
            className="absolute inset-0 bg-gradient-shine bg-[length:10px_10px] opacity-50 animate-gradient"
          />
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-700 ease-out animate-progress-fill relative"
            style={{ width: `${formProgress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-shine bg-[length:10px_10px] opacity-25 animate-gradient"/>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-4 text-xs text-gray-500">
          <span>Tema</span>
          <span>Público</span>
          <span>Capítulos</span>
          <span>Estilo</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg transition-all duration-300 hover:shadow-hover
        relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary-50/5 before:to-accent-500/5 before:animate-gradient">
        {/* Campo Tema */}
        <div className="relative group">
          <label htmlFor="tema" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <HiLightBulb className="text-primary-500" />
            Tema do E-book <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="tema"
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-input 
                     dark:bg-gray-700 dark:text-white
                     focus:ring-primary-500 focus:border-primary-500 
                     transition-all duration-200 ease-in-out
                     hover:border-primary-400
                     group-hover:shadow-hover"
            placeholder="Ex: Marketing de Conteúdo para B2B"
            data-tooltip-id="tema-tip"
            data-tooltip-content="Escolha um tema específico e relevante para seu público"
          />
          <Tooltip id="tema-tip" place="right" />
        </div>

        {/* Campo Público-Alvo */}
        <div className="relative group">
          <label htmlFor="publicoAlvo" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <HiUsers className="text-primary-500" />
            Público-Alvo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="publicoAlvo"
            value={publicoAlvo}
            onChange={(e) => setPublicoAlvo(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-input 
                     dark:bg-gray-700 dark:text-white
                     focus:ring-primary-500 focus:border-primary-500 
                     transition-all duration-200 ease-in-out
                     hover:border-primary-400
                     group-hover:shadow-hover"
            placeholder="Ex: Donos de pequenas empresas de software"
            data-tooltip-id="publico-tip"
            data-tooltip-content="Descreva seu público-alvo de forma específica"
          />
          <Tooltip id="publico-tip" place="right" />
        </div>

        {/* Campo Número de Capítulos */}
        <div className="relative group">
          <label htmlFor="numCapitulos" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <HiBookOpen className="text-primary-500" />
            Número de Capítulos
          </label>
          <select
            id="numCapitulos"
            value={numCapitulos}
            onChange={(e) => setNumCapitulos(parseInt(e.target.value, 10))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-input 
                     dark:bg-gray-700 dark:text-white
                     focus:ring-primary-500 focus:border-primary-500 
                     transition-all duration-200 ease-in-out
                     hover:border-primary-400
                     group-hover:shadow-hover"
            data-tooltip-id="capitulos-tip"
            data-tooltip-content="Escolha um número adequado de capítulos para seu conteúdo"
          >
            <option value={3}>3 Capítulos</option>
            <option value={4}>4 Capítulos</option>
            <option value={5}>5 Capítulos</option>
          </select>
          <Tooltip id="capitulos-tip" place="right" />
        </div>

        {/* Campo Estilo de Escrita */}
        <div className="relative group">
          <label htmlFor="estiloEscrita" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <HiPencil className="text-primary-500" />
            Estilo de Escrita
          </label>
          <select
            id="estiloEscrita"
            value={estiloEscrita}
            onChange={(e) => setEstiloEscrita(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-input 
                     dark:bg-gray-700 dark:text-white
                     focus:ring-primary-500 focus:border-primary-500 
                     transition-all duration-200 ease-in-out
                     hover:border-primary-400
                     group-hover:shadow-hover"
            data-tooltip-id="estilo-tip"
            data-tooltip-content="Escolha o tom de voz que melhor se adequa ao seu público"
          >
            <option value="formal">Formal</option>
            <option value="descontraido">Descontraído</option>
            <option value="persuasivo">Persuasivo</option>
          </select>
          <Tooltip id="estilo-tip" place="right" />
        </div>

        {/* Botão Submit */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex items-center justify-center gap-2 py-4 px-6 border border-transparent rounded-lg 
                     text-base font-medium text-white
                     bg-gradient-to-r from-primary-600 to-accent-500 hover:from-primary-700 hover:to-accent-600
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                     transition-all duration-300 ease-in-out transform hover:scale-[1.02]
                     shadow-lg hover:shadow-xl
                     disabled:opacity-50 disabled:cursor-not-allowed
                     relative overflow-hidden
                     ${isSubmitting ? 'animate-pulse-slow' : 'animate-gradient bg-[length:200%_200%]'}`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Gerando...
              </>
            ) : (
              'Gerar E-book'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EbookForm;
