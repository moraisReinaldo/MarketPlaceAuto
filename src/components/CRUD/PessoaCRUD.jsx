import axios from 'axios';

// Função para buscar as pessoas
export const buscarPessoas = async () => {
    try {
        const response = await axios.get('http://localhost:3001/pessoas');
        return response.data; // Retorna as pessoas
    } catch (error) {
        console.error('Erro ao buscar pessoas:', error.response ? error.response.data : error.message);
    }
};

// Função para criar uma pessoa
export const criarPessoa = async (nome, usuario, senha) => {
    try {
        const pessoa = { nome, usuario, senha };
        await axios.post('http://localhost:3001/pessoas', pessoa);
    } catch (error) {
        console.error('Erro ao criar pessoa:', error);
    }
};

// Função para deletar uma pessoa
export const deletarPessoa = async (id) => {
    try {
        await axios.delete(`http://localhost:3001/pessoas/${id}`);
    } catch (error) {
        console.error('Erro ao deletar pessoa:', error);
    }
};
