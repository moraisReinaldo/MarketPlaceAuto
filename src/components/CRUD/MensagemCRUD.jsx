import axios from 'axios';

// Função para buscar as mensagens
// Função para buscar as mensagens
export const buscarMensagens = async (codPessoa) => {
    try {
      const response = await axios.get(`http://localhost:3001/mensagens/${codPessoa}`);
      return response.data; // Retorna as mensagens
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    }
  };
  

// Função para criar uma mensagem
export const criarMensagem = async (codChat, codPessoa, texto) => {
    try {
        const mensagem = { codChat, codPessoa, texto };
        await axios.post('http://localhost:3001/mensagens', mensagem);
    } catch (error) {
        console.error('Erro ao criar mensagem:', error);
    }
};

// Função para deletar uma mensagem
export const deletarMensagem = async (id) => {
    try {
        await axios.delete(`http://localhost:3001/mensagens/${id}`);
    } catch (error) {
        console.error('Erro ao deletar mensagem:', error);
    }
};

export const enviarMensagem = async (mensagem, codChat, codPessoa) => {
    try {
        const mensagemData = { codChat, codPessoa, texto: mensagem };
        await axios.post('http://localhost:3001/mensagens', mensagemData);
        console.log('Mensagem enviada com sucesso');
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
    }
};
