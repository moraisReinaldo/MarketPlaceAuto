import axios from 'axios';

// Função para buscar os chats de um usuário
export const buscarChats = async (codPessoa1) => {
    try {
        // Usando a nova rota que utiliza o parâmetro ':userId'
        const response = await axios.get(`http://localhost:3001/chats/${codPessoa1}`);
        return response.data; // Ajuste conforme a estrutura de dados retornada pela API
    } catch (error) {
        console.error('Erro ao buscar chats:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// Função para enviar uma mensagem para um chat
export const enviarMensagem = async (mensagem, codPessoa1, codPessoa2) => {
    try {
        // Verificar se todos os campos estão preenchidos
        if (!mensagem || !codPessoa1 || !codPessoa2) {
            throw new Error('Campos obrigatórios não preenchidos');
        }

        // Chama a API para criar o chat (se necessário) e enviar a mensagem
        const response = await axios.post('http://localhost:3001/mensagens', {
            codPessoa1: codPessoa1,
            codPessoa2: codPessoa2,
            texto: mensagem
        });

        console.log('Mensagem enviada com sucesso:', response.data);
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error.response ? error.response.data : error.message);
    }
};

// Função para buscar chat (caso não exista, pode ser criado)
const buscarChat = async (codPessoa1, codPessoa2) => {
    try {
        const response = await axios.get(`http://localhost:3001/chats/${codPessoa1}`);
        const chat = response.data.find((chat) =>
            (chat.Codpessoa1 === codPessoa1 && chat.Codpessoa2 === codPessoa2) ||
            (chat.Codpessoa1 === codPessoa2 && chat.Codpessoa2 === codPessoa1)
        );
        return chat || {};  // Retorna o chat ou um objeto vazio caso não exista
    } catch (error) {
        console.error('Erro ao buscar chat:', error.response ? error.response.data : error.message);
        return {};  // Retorna um objeto vazio em caso de erro
    }
};
// Função para deletar um chat
export const deletarChat = async (chatId) => {
    try {
        await axios.delete(`http://localhost:3001/chats/${chatId}`);
        console.log('Chat deletado com sucesso');
    } catch (error) {
        console.error('Erro ao deletar chat:', error);
    }
};