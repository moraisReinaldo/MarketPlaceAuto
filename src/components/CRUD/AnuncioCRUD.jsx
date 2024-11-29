import axios from 'axios';

// Função para buscar os anúncios
export const buscarAnuncios = async () => {
    try {
      const response = await axios.get('http://localhost:3001/anuncios');
      return response.data; // Retorna os anúncios
    } catch (error) {
      console.error('Erro ao buscar anúncios:', error);
      return [];
    }
  };

  export const criarAnuncio = async (nome, valor, desc, ano, versao, linkFoto) => {
    try {
      const codPessoa = localStorage.getItem('codPessoa');
      if (!codPessoa) throw new Error('CodPessoa não encontrado no localStorage.');
  
      const anuncio = {
        nome,
        valor,
        desc,
        ano,
        versao,
        codPessoa, // Inclui o codPessoa aqui
        linkFoto,  // Usa o linkFoto correto
      };
  
      console.log('Anúncio a ser enviado:', anuncio); // Verifica os dados antes do envio
      await axios.post('http://localhost:3001/anuncios', anuncio);
    } catch (error) {
      console.error('Erro ao criar anúncio:', error);
      alert('Erro ao criar anúncio: ' + error.message);
    }
  };

// Função para deletar um anúncio
export const deletarAnuncio = async (id) => {
    try {
        await axios.delete(`http://localhost:3001/anuncios/${id}`);
    } catch (error) {
        console.error('Erro ao deletar anúncio:', error);
    }
};
