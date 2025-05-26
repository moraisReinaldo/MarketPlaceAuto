// Funções CRUD para Pessoas usando fetch e alinhadas ao novo backend

const API_URL = 'http://localhost:3001'; // Centralizar a URL base da API

// Função para buscar dados de uma pessoa específica por ID
// Útil para buscar dados do usuário logado ou de outros perfis, se necessário.
export const buscarPessoaPorId = async (id) => {
    try {
        if (!id) {
            throw new Error('ID da pessoa não fornecido.');
        }
        const response = await fetch(`${API_URL}/pessoas/${id}`);
        if (!response.ok) {
            const errorData = await response.json();
            // Tratar 404 (Não encontrado) de forma específica
            if (response.status === 404) {
                 console.warn(`Pessoa com ID ${id} não encontrada.`);
                 return null; // Retorna null se não encontrado
            }
            throw new Error(errorData.error || `Erro ${response.status} ao buscar pessoa.`);
        }
        return await response.json(); // Retorna os dados da pessoa (sem a senha)
    } catch (error) {
        console.error('Erro ao buscar pessoa por ID:', error);
        alert(`Erro ao buscar dados do usuário: ${error.message}`);
        return null; // Retorna null em caso de outros erros
    }
};

// Função para deletar uma pessoa (e todos os dados associados)
export const deletarPessoa = async (id) => {
    try {
        if (!id) {
            throw new Error('ID da pessoa não fornecido para exclusão.');
        }

        // Confirmação extra pode ser adicionada no componente que chama esta função
        console.log(`Tentando deletar pessoa com ID: ${id}`);

        const response = await fetch(`${API_URL}/pessoas/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
             if (response.status === 404) {
                 throw new Error('Usuário não encontrado para exclusão.');
            }
            throw new Error(errorData.error || `Erro ${response.status} ao deletar pessoa.`);
        }

        const data = await response.json();
        console.log('Pessoa deletada com sucesso:', data);
        alert('Conta deletada com sucesso!'); // Mensagem em português
        // Após deletar, geralmente é necessário deslogar o usuário e redirecionar
        localStorage.removeItem('codPessoa');
        localStorage.removeItem('nomePessoa');
        localStorage.removeItem('usuarioPessoa');
        // O redirecionamento deve ser feito no componente
        return data;

    } catch (error) {
        console.error('Erro ao deletar pessoa:', error);
        alert(`Erro ao deletar conta: ${error.message}`);
        throw error;
    }
};

// A função buscarPessoas (listar todas) geralmente não é segura ou necessária no frontend.
// A função criarPessoa foi movida para o componente Register.jsx.

