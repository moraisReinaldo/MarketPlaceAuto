const API_URL = 'http://localhost:3001'; // Centralizar a URL base da API

// Função para buscar os anúncios com filtros opcionais
export const buscarAnuncios = async (filtros = {}) => {
    try {
        const params = new URLSearchParams();
        if (filtros.modelo) params.append('modelo', filtros.modelo);
        if (filtros.versao) params.append('versao', filtros.versao);
        if (filtros.ano) params.append('ano', filtros.ano);
        if (filtros.precoMin) params.append('precoMin', filtros.precoMin);
        if (filtros.precoMax) params.append('precoMax', filtros.precoMax);

        const queryString = params.toString();
        const url = `${API_URL}/anuncios${queryString ? '?' + queryString : ''}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro ${response.status} ao buscar anúncios.`);
        }
        return await response.json(); // Retorna os anúncios
    } catch (error) {
        console.error('Erro ao buscar anúncios:', error);
        alert(`Erro ao buscar anúncios: ${error.message}`); // Informa o usuário
        return []; // Retorna array vazio em caso de erro
    }
};

export const criarAnuncio = async (dadosAnuncio) => {
    // dadosAnuncio deve ser um objeto { valor, descricao, codVersao, fotos: [link1, link2,...] }
    try {
        const codPessoa = localStorage.getItem('codPessoa');
        if (!codPessoa) {
            throw new Error('Usuário não autenticado. Faça login para criar anúncios.');
        }

        const anuncioParaEnviar = {
            ...dadosAnuncio,
            codPessoa: parseInt(codPessoa, 10), // Garante que codPessoa é número
        };

        // Validação básica
        if (!anuncioParaEnviar.valor || !anuncioParaEnviar.codVersao || !anuncioParaEnviar.fotos || anuncioParaEnviar.fotos.length === 0) {
             throw new Error('Valor, versão e pelo menos uma foto são obrigatórios.');
        }

        console.log('Enviando para criar anúncio:', anuncioParaEnviar); // Log para debug

        const response = await fetch(`${API_URL}/anuncios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(anuncioParaEnviar),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro ${response.status} ao criar anúncio.`);
        }

        const data = await response.json();
        console.log('Anúncio criado com sucesso:', data);
        alert('Anúncio criado com sucesso!');
        return data; // Retorna o ID do anúncio criado

    } catch (error) {
        console.error('Erro ao criar anúncio:', error);
        alert(`Erro ao criar anúncio: ${error.message}`);
        throw error; // Re-lança o erro para tratamento no componente
    }
};

// Função para editar um anúncio existente
export const editarAnuncio = async (idAnuncio, dadosUpdate) => {
     // dadosUpdate deve ser um objeto { valor?, descricao?, fotos?: [link1, link2,...] }
    try {
        // Validação básica
        if (!dadosUpdate.valor && !dadosUpdate.descricao && !dadosUpdate.fotos) {
            throw new Error('Nenhum dado fornecido para atualização.');
        }

        console.log(`Enviando para editar anúncio ${idAnuncio}:`, dadosUpdate); // Log para debug

        const response = await fetch(`${API_URL}/anuncios/${idAnuncio}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosUpdate),
        });

        // Capturar o texto completo da resposta para diagnóstico
        const responseText = await response.text();
        console.log(`Resposta completa do servidor (status ${response.status}):`, responseText);
        
        let errorMessage = `Erro ${response.status} ao editar anúncio.`;
        let errorDetails = '';
        
        // Tentar analisar a resposta como JSON, se possível
        try {
            const responseData = JSON.parse(responseText);
            if (!response.ok) {
                errorMessage = responseData.error || errorMessage;
                errorDetails = responseData.details || '';
            } else {
                console.log('Anúncio editado com sucesso:', responseData);
                alert('Anúncio atualizado com sucesso!');
                return responseData;
            }
        } catch (parseError) {
            // Se não for JSON válido, usar o texto bruto
            console.error('Erro ao analisar resposta JSON:', parseError);
            errorDetails = responseText;
        }
        
        // Se chegou aqui, houve erro
        throw new Error(`${errorMessage}${errorDetails ? ` Detalhes: ${errorDetails}` : ''}`);

    } catch (error) {
        console.error('Erro ao editar anúncio:', error);
        alert(`Erro ao editar anúncio: ${error.message}`);
        throw error;
    }
};


// Função para deletar um anúncio
export const deletarAnuncio = async (id) => {
    try {
        const response = await fetch(`${API_URL}/anuncios/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro ${response.status} ao deletar anúncio.`);
        }

        const data = await response.json();
        console.log('Anúncio deletado com sucesso:', data);
        alert('Anúncio deletado com sucesso!');
        return data;

    } catch (error) {
        console.error('Erro ao deletar anúncio:', error);
        alert(`Erro ao deletar anúncio: ${error.message}`);
        throw error;
    }
};

// Função para buscar um anúncio específico pelo ID
export const buscarAnuncioPorId = async (idAnuncio) => {
    try {
        const url = `${API_URL}/anuncios/${idAnuncio}`;
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro ${response.status} ao buscar o anúncio.`);
        }
        return await response.json(); // Retorna os detalhes do anúncio
    } catch (error) {
        console.error(`Erro ao buscar anúncio ${idAnuncio}:`, error);
        alert(`Erro ao buscar detalhes do anúncio: ${error.message}`);
        throw error; // Re-lança o erro para tratamento no componente
    }
};
