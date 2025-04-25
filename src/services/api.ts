import axios from 'axios';

interface EbookData {
  tema: string;
  publicoAlvo: string;
  numCapitulos: number;
  estiloEscrita: string;
}

export const generateEbook = async (data: EbookData) => {
  try {
    // Chama nossa API route proxy em vez do webhook diretamente
    const response = await axios.post('/api/generate-proxy', data);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao gerar e-book:', error);
    if (error.response?.data?.error) {
      // Se o proxy retornou uma mensagem de erro específica
      throw new Error(error.response.data.error);
    }
    throw new Error('Falha ao gerar o e-book. Tente novamente.');
  }
};
