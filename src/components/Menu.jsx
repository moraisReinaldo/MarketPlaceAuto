import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buscarPessoas } from './CRUD/PessoaCRUD'; // Supondo que as funções estão no arquivo PessoaCRUD
import { buscarAnuncios, deletarAnuncio } from './CRUD/AnuncioCRUD'; // Importa a função de deletar
import './CSS/Menu.css'; // Certifique-se de ter esse arquivo de estilo CSS

const Menu = () => {
  const [anuncios, setAnuncios] = useState([]); // Armazena todos os anúncios
  const [user, setUser] = useState(null); // Armazena os dados do usuário logado
  const [pessoas, setPessoas] = useState([]); // Armazena todas as pessoas
  const navigate = useNavigate();

  useEffect(() => {
    const codPessoa = localStorage.getItem('codPessoa');
    if (codPessoa) {
      const fetchUser = async () => {
        try {
          // Busca todas as pessoas e identifica o usuário logado
          const pessoasData = await buscarPessoas();
          const usuario = pessoasData.find(pessoa => pessoa.CodPessoa === parseInt(codPessoa));
          setUser(usuario);
          setPessoas(pessoasData); // Atualiza a lista de pessoas

          if (!usuario) {
            console.log('Usuário não encontrado');
            navigate('/'); // Redireciona para a página de login
          }
        } catch (error) {
          console.error('Erro ao buscar usuário:', error);
          navigate('/'); // Redireciona para a página de login em caso de erro
        }
      };

      fetchUser();
      fetchAnuncios(); // Busca todos os anúncios
    } else {
      console.log('CodPessoa não encontrado no localStorage');
      navigate('/'); // Redireciona para a página de login
    }
  }, [navigate]);

  const fetchAnuncios = async () => {
    try {
      const anunciosData = await buscarAnuncios();
      setAnuncios(anunciosData); // Atualiza a lista de anúncios sem filtros
    } catch (error) {
      console.error('Erro ao buscar anúncios:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletarAnuncio(id); // Chama a função para deletar o anúncio
      setAnuncios(prev => prev.filter(anuncio => anuncio.CodAnuncio !== id)); // Remove o anúncio deletado da lista
      console.log('Anúncio deletado com sucesso');
    } catch (error) {
      console.error('Erro ao deletar anúncio:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('codPessoa'); // Remove CodPessoa do localStorage ao sair
    navigate('/'); // Redireciona para o login após logout
  };

  const goToCriarAnuncio = () => {
    navigate('/criar-anuncio');
  };

  // Função para navegar para a página de chats
  const goToChats = () => {
    navigate('/chats'); // Redireciona para a página de chats
  };

  return (
    <div className="menu-container">
      <header className="menu-header">
        <h2>Menu</h2>
        {user && <h3>Bem-vindo, {user.nome}</h3>}
      </header>

      <div className="button-group">
        <button onClick={handleLogout} className="logout-button">Sair</button>
        <button onClick={goToCriarAnuncio} className="create-anuncio-button">Criar Anúncio</button>
        <button onClick={goToChats} className="chat-button">Ir para os Chats</button>
      </div>

      <h3>Lista de Anúncios</h3>
      <ul className="anuncios-list">
        {anuncios.map((anuncio) => {
          const dono = pessoas.find(pessoa => pessoa.CodPessoa === anuncio.CodPessoa);
          return (
            <li key={anuncio.CodAnuncio} className="anuncio-item">
              <img src={anuncio.linkFoto} alt={anuncio.nome} className="anuncio-img" />
              <div className="anuncio-info">
                <p><strong>{anuncio.nome}</strong> - {anuncio.valor}</p>
                <p>{anuncio.desc}</p>
                <p>{anuncio.ano} - {anuncio.versao}</p>
                <p><em>Proprietário: {dono ? dono.nome : 'Desconhecido'}</em></p>
                {user && anuncio.CodPessoa === user.CodPessoa && (
                <button onClick={() => handleDelete(anuncio.CodAnuncio)} className="delete-button">Apagar Anúncio</button>
              )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Menu;
