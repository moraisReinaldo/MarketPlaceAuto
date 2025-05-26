import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { buscarPessoaPorId, deletarPessoa } from './CRUD/PessoaCRUD.jsx';
import { buscarAnuncios, deletarAnuncio } from './CRUD/AnuncioCRUD.jsx';
import '../index.css'; // Estilos globais
import './CSS/Menu.css'; // Estilos específicos do Menu modernizados

const Menu = () => {
  const [anuncios, setAnuncios] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAnuncios, setLoadingAnuncios] = useState(false);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({ // Estado para filtros
    modelo: '',
    versao: '',
    ano: '',
    precoMin: '',
    precoMax: ''
  });
  const [modelos, setModelos] = useState([]); // Para popular o filtro de modelo
  const [versoes, setVersoes] = useState([]); // Para popular o filtro de versão

  const navigate = useNavigate();

  // Busca dados do usuário e modelos iniciais
  useEffect(() => {
    const codPessoa = localStorage.getItem('codPessoa');
    if (codPessoa) {
      const fetchData = async () => {
        try {
          setLoading(true);
          setError('');
          const usuarioData = await buscarPessoaPorId(codPessoa);
          if (!usuarioData) {
            throw new Error('Usuário não encontrado ou sessão inválida.');
          }
          setUser(usuarioData);

          // Buscar modelos para o filtro
          const responseModelos = await fetch('http://localhost:3001/modelos'); // Ajustar URL se necessário
          if (!responseModelos.ok) throw new Error('Erro ao buscar modelos para filtro.');
          setModelos(await responseModelos.json());

          await fetchAnuncios(); // Busca anúncios iniciais (sem filtro)

        } catch (err) {
          console.error('Erro ao inicializar Menu:', err);
          setError(err.message);
          handleLogout(); // Desloga em caso de erro crítico
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      console.log('CodPessoa não encontrado no localStorage');
      navigate('/login');
    }
  }, [navigate]);

  // Busca versões quando um modelo é selecionado no filtro
  useEffect(() => {
    if (filtros.modelo) {
      const fetchVersoesFiltro = async () => {
        try {
          setVersoes([]);
          setFiltros(prev => ({ ...prev, versao: '' }));
          const response = await fetch(`http://localhost:3001/versoes/${filtros.modelo}`); // Ajustar URL
          if (!response.ok) throw new Error('Erro ao buscar versões para filtro.');
          setVersoes(await response.json());
        } catch (err) {
          console.error(err);
          setError('Falha ao carregar versões para o filtro.');
        }
      };
      fetchVersoesFiltro();
    } else {
      setVersoes([]);
    }
  }, [filtros.modelo]);

  // Função para buscar anúncios (com ou sem filtros)
  const fetchAnuncios = async (filtrosAtuais = filtros) => {
    try {
      setLoadingAnuncios(true);
      setError('');
      const anunciosData = await buscarAnuncios(filtrosAtuais);
      setAnuncios(anunciosData);
    } catch (error) {
      console.error('Erro ao buscar anúncios:', error);
      setError(`Falha ao buscar anúncios: ${error.message}`);
      setAnuncios([]); // Limpa anúncios em caso de erro
    } finally {
      setLoadingAnuncios(false);
    }
  };

  // Handler para mudança nos filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  // Handler para aplicar filtros
  const handleAplicarFiltros = (e) => {
    e.preventDefault(); // Previne submit se estiver em form
    fetchAnuncios(filtros);
  };

  // Handler para limpar filtros
  const handleLimparFiltros = () => {
    const filtrosZerados = {
      modelo: '',
      versao: '',
      ano: '',
      precoMin: '',
      precoMax: ''
    };
    setFiltros(filtrosZerados);
    fetchAnuncios(filtrosZerados); // Busca todos novamente
  };

  // Handler para deletar anúncio
  const handleDeleteAnuncio = async (id) => {
    if (window.confirm('Tem certeza que deseja apagar este anúncio?')) {
      try {
        await deletarAnuncio(id);
        setAnuncios(prev => prev.filter(anuncio => anuncio.CodAnuncio !== id));
        alert('Anúncio apagado com sucesso!');
      } catch (error) {
        console.error('Erro no componente ao deletar anúncio:', error);
        // Erro já tratado na função deletarAnuncio com alert
      }
    }
  };

  // Handler para deletar conta
  const handleDeleteConta = async () => {
    if (window.confirm('ATENÇÃO: Tem certeza que deseja apagar sua conta? Todos os seus anúncios e chats serão perdidos permanentemente.')) {
      if (user && user.id) {
        try {
          await deletarPessoa(user.id);
          // A função deletarPessoa já limpa o localStorage e mostra alert
          navigate('/login'); // Redireciona após sucesso
        } catch (error) {
          console.error('Erro no componente ao deletar conta:', error);
          // Erro já tratado na função deletarPessoa com alert
        }
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('codPessoa');
    localStorage.removeItem('nomePessoa');
    localStorage.removeItem('usuarioPessoa');
    navigate('/login');
  };

  const goToCriarAnuncio = () => navigate('/criar-anuncio');
  const goToChats = () => navigate('/chats');
  const goToEditarAnuncio = (idAnuncio) => navigate(`/editar-anuncio/${idAnuncio}`); // Rota a ser criada

  // --- Renderização --- //

  if (loading && !user) {
    return <div className="container text-center mt-3"><p>Carregando...</p></div>;
  }

  if (error && !user) {
    return (
      <div className="container text-center mt-3">
        <p className="alert alert-danger">Erro ao carregar dados do usuário: {error}</p>
        <Link to="/login"><button>Tentar Login Novamente</button></Link>
      </div>
    );
  }

  return (
    <div className="container menu-container">
      <header className="menu-header text-center">
        <h2>Marketplace CarBuy</h2>
        {user && <h3>Bem-vindo(a), {user.nome}!</h3>}
        <div className="button-group">
          <button onClick={goToCriarAnuncio} className="create-anuncio-button">Criar Anúncio</button>
          <button onClick={goToChats} className="chat-button">Meus Chats</button>
          <button onClick={handleDeleteConta} className="delete-account-button">Deletar Conta</button>
          <button onClick={handleLogout} className="logout-button">Sair</button>
        </div>
      </header>

      {/* Seção de Filtros Redesenhada */}
      <section className="filter-section card">
        <h4>Filtrar Anúncios</h4>
        <form onSubmit={handleAplicarFiltros} className="filter-controls">
          {/* Filtro Modelo */}
          <select name="modelo" value={filtros.modelo} onChange={handleFiltroChange} className="form-select">
            <option value="">Todos os Modelos</option>
            {modelos.map(m => <option key={m.CodModelo} value={m.CodModelo}>{m.nome}</option>)}
          </select>
          {/* Filtro Versão */}
          <select name="versao" value={filtros.versao} onChange={handleFiltroChange} disabled={!filtros.modelo || versoes.length === 0} className="form-select">
            <option value="">Todas as Versões</option>
            {versoes.map(v => <option key={v.CodVersao} value={v.CodVersao}>{v.nome} ({v.ano})</option>)}
          </select>
          {/* Filtro Ano */}
          <input type="number" name="ano" placeholder="Ano" value={filtros.ano} onChange={handleFiltroChange} className="form-control" />
          {/* Filtro Preço Mínimo */}
          <input type="number" name="precoMin" placeholder="Preço Mín." value={filtros.precoMin} onChange={handleFiltroChange} className="form-control" />
          {/* Filtro Preço Máximo */}
          <input type="number" name="precoMax" placeholder="Preço Máx." value={filtros.precoMax} onChange={handleFiltroChange} className="form-control" />
          {/* Botões de Ação dos Filtros */}
          <div style={{ gridColumn: 'span 2', display: 'flex', gap: 'var(--spacing-unit)', justifyContent: 'center' }}> {/* Ocupa espaço e centraliza botões */} 
            <button type="submit" className="btn btn-primary">Aplicar Filtros</button>
            <button type="button" onClick={handleLimparFiltros} className="btn btn-secondary">Limpar Filtros</button>
          </div>
        </form>
      </section>

      {/* Exibição de Erros Gerais */}
      {error && <p className="alert alert-danger text-center">{error}</p>}

      {/* Lista de Anúncios Redesenhada */}
      <section className="mt-3">
        <h3>Anúncios Disponíveis</h3>
        {loadingAnuncios ? (
          <div className="text-center"><p>Carregando anúncios...</p></div>
        ) : (
          anuncios.length === 0 ? (
            <p className="text-center text-muted">Nenhum anúncio encontrado com os filtros selecionados.</p>
          ) : (
            <ul className="anuncios-grid">
              {anuncios.map((anuncio) => (
                <li key={anuncio.CodAnuncio} className="anuncio-card card">
                  <div className="anuncio-img-container">
                    <img
                      src={anuncio.fotos && anuncio.fotos.length > 0 ? anuncio.fotos[0].linkFoto : '/placeholder.png'} // Usar placeholder local
                      alt={`${anuncio.nomeModelo} ${anuncio.nomeVersao}`}
                      className="anuncio-img"
                      onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }} // Fallback
                    />
                  </div>
                  <div className="anuncio-info">
                    <h5>{anuncio.nomeModelo} {anuncio.nomeVersao} ({anuncio.ano})</h5>
                    <p>Vendedor: {anuncio.nomeVendedor}</p>
                    <p className="anuncio-descricao">{anuncio.descricao ? anuncio.descricao.substring(0, 100) + (anuncio.descricao.length > 100 ? '...' : '') : 'Sem descrição.'}</p>
                    <p className="price mt-auto">R$ {parseFloat(anuncio.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="anuncio-actions">
                    {user && anuncio.CodPessoa === user.id ? (
                      <>
                        <button onClick={() => goToEditarAnuncio(anuncio.CodAnuncio)} className="btn btn-sm edit-button">Editar</button>
                        <button onClick={() => handleDeleteAnuncio(anuncio.CodAnuncio)} className="btn btn-sm delete-button">Apagar</button>
                      </>
                    ) : (
                      // Botão Iniciar Chat (não aparece se for o próprio anúncio)
                      user && (
                         // A lógica de iniciar chat será refinada na próxima etapa
                         // Temporariamente, pode apenas mostrar um botão ou link
                         <button onClick={() => alert(`Iniciar chat com ${anuncio.nomeVendedor} (ID: ${anuncio.CodPessoa}) - Funcionalidade em desenvolvimento`)} className="btn btn-sm btn-info">Conversar</button>
                      )
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )
        )}
      </section>
       {/* Estilos específicos inline (poderiam ir para um CSS) */}
       <style>{`
        .alert { padding: var(--spacing-unit); margin-bottom: var(--spacing-unit); border: 1px solid transparent; border-radius: var(--border-radius); }
        .alert-danger { color: var(--danger-color); background-color: rgba(var(--danger-color-rgb, 220, 53, 69), 0.1); border-color: rgba(var(--danger-color-rgb, 220, 53, 69), 0.2); }
        .text-muted { color: var(--secondary-color) !important; }
        .btn { /* Estilo base */
            display: inline-block; font-weight: 400; line-height: 1.6; text-align: center; vertical-align: middle; cursor: pointer; user-select: none; border: 1px solid transparent; padding: .375rem .75rem; font-size: 1rem; border-radius: var(--border-radius); transition: all .15s ease-in-out;
        }
        .btn-primary { color: #fff; background-color: var(--primary-color); border-color: var(--primary-color); }
        .btn-secondary { color: #fff; background-color: var(--secondary-color); border-color: var(--secondary-color); }
        .btn-info { color: #fff; background-color: var(--info-color); border-color: var(--info-color); }
        .btn:hover { filter: brightness(0.9); }
        .btn-sm { padding: .25rem .5rem; font-size: .875rem; border-radius: .2rem; }
        .form-select, .form-control { /* Estilos base para inputs/selects */
            display: block; width: 100%; padding: .375rem .75rem; font-size: 1rem; font-weight: 400; line-height: 1.6; color: var(--light-text); background-color: var(--light-card-bg); background-clip: padding-box; border: 1px solid var(--light-border); appearance: none; border-radius: var(--border-radius); transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
        }
        @media (prefers-color-scheme: dark) {
            .form-select, .form-control { color: var(--dark-text); background-color: var(--dark-card-bg); border: 1px solid var(--dark-border); }
        }
       `}</style>
    </div>
  );
};

export default Menu;

