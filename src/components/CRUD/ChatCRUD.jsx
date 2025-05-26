// Funções CRUD para Chats e Mensagens usando fetch e alinhadas ao novo backend

const API_URL = 'http://localhost:3001'; // Centralizar a URL base da API

// Função para buscar os chats de um usuário
export const buscarChats = async (userId) => {
    try {
        if (!userId) {
            throw new Error('ID do usuário não fornecido.');
        }
        const response = await fetch(`${API_URL}/chats/${userId}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro ${response.status} ao buscar chats.`);
        }
        return await response.json(); // Retorna a lista de chats
    } catch (error) {
        console.error('Erro ao buscar chats:', error);
        alert(`Erro ao buscar chats: ${error.message}`);
        return [];
    }
};

// Função para buscar as mensagens de um chat específico
export const buscarMensagens = async (chatId) => {
    try {
        if (!chatId) {
            throw new Error('ID do chat não fornecido.');
        }
        const response = await fetch(`${API_URL}/mensagens/${chatId}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro ${response.status} ao buscar mensagens.`);
        }
        return await response.json(); // Retorna a lista de mensagens
    } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        alert(`Erro ao buscar mensagens: ${error.message}`);
        return [];
    }
};

// Função para iniciar um novo chat (ou obter o existente)
export const iniciarChat = async (codPessoa1, codPessoa2) => {
    try {
        if (!codPessoa1 || !codPessoa2) {
            throw new Error('IDs dos dois participantes são obrigatórios.');
        }
        if (codPessoa1 === codPessoa2) {
             throw new Error('Não é possível iniciar um chat consigo mesmo.');
        }

        const response = await fetch(`${API_URL}/chats`, { // Assumindo endpoint POST /chats para criar/obter
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ codPessoa1, codPessoa2 }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro ${response.status} ao iniciar chat.`);
        }

        const data = await response.json();
        console.log('Chat iniciado/obtido com sucesso:', data);
        return data; // Retorna o chat (novo ou existente)

    } catch (error) {
        console.error('Erro ao iniciar chat:', error);
        alert(`Erro ao iniciar conversa: ${error.message}`);
        throw error;
    }
};

// Função para enviar uma nova mensagem (cria chat se necessário)
export const enviarMensagem = async (codRemetente, codDestinatario, texto) => {
    try {
        if (!codRemetente || !codDestinatario || !texto) {
            throw new Error('Remetente, destinatário e texto são obrigatórios.');
        }

        // Primeiro, garante que o chat existe (ou cria um novo)
        const chatInfo = await iniciarChat(codRemetente, codDestinatario);
        if (!chatInfo || !chatInfo.codChat) {
            throw new Error("Não foi possível obter ou criar o chat para enviar a mensagem.");
        }

        // Agora envia a mensagem para o chat existente/criado
        const response = await fetch(`${API_URL}/mensagens`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // O backend deve associar a mensagem ao chat correto usando remetente/destinatário
            body: JSON.stringify({ codRemetente, codDestinatario, texto }), 
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro ${response.status} ao enviar mensagem.`);
        }

        const data = await response.json();
        console.log('Mensagem enviada com sucesso:', data);
        return data; // Retorna a mensagem criada

    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        alert(`Erro ao enviar mensagem: ${error.message}`);
        throw error;
    }
};

// Função para deletar um chat e suas mensagens
export const deletarChat = async (chatId) => {
    try {
        if (!chatId) {
            throw new Error('ID do chat não fornecido.');
        }
        const response = await fetch(`${API_URL}/chats/${chatId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro ${response.status} ao deletar chat.`);
        }

        const data = await response.json();
        console.log('Chat deletado com sucesso:', data);
        alert('Conversa deletada com sucesso!');
        return data;

    } catch (error) {
        console.error('Erro ao deletar chat:', error);
        alert(`Erro ao deletar conversa: ${error.message}`);
        throw error;
    }
};

