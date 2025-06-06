
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { buscarPessoaPorId, deletarPessoa } from './CRUD/PessoaCRUD.jsx';
import { buscarAnuncios, deletarAnuncio } from './CRUD/AnuncioCRUD.jsx';
import { enviarMensagem } from './CRUD/ChatCRUD.jsx';
// Remover import de AnuncioCard.jsx
import '../index.css';
import './CSS/Menu.css';


const Menu = () => {
  const codPessoa = localStorage.getItem('codPessoa');
  const [anuncios, setAnuncios] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAnuncios, setLoadingAnuncios] = useState(false);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({
    modelo: '',
    versao: '',
    ano: '',
    precoMin: '',
    precoMax: ''
  });
  const [modelos, setModelos] = useState([]);
  const [versoes, setVersoes] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 8;

  // Estado para controlar o índice da foto atual de cada anúncio
  // A chave será o CodAnuncio, o valor será o índice (começando em 0)
  const [indicesFotosAtuais, setIndicesFotosAtuais] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const codPessoaStorage = localStorage.getItem('codPessoa');
    if (codPessoaStorage) {
      const fetchData = async () => {
        try {
          setLoading(true);
          setError('');
          const usuarioData = await buscarPessoaPorId(codPessoaStorage);
          if (!usuarioData) {
            throw new Error('Usuário não encontrado ou sessão inválida.');
          }
          setUser(usuarioData);

          const responseModelos = await fetch('http://localhost:3001/modelos');
          if (!responseModelos.ok) throw new Error('Erro ao buscar modelos para filtro.');
          setModelos(await responseModelos.json());

          await fetchAnuncios();
        } catch (err) {
          console.error('Erro ao inicializar Menu:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      navigate('/login');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    if (filtros.modelo) {
      const fetchVersoesFiltro = async () => {
        try {
          setVersoes([]);
          const response = await fetch(`http://localhost:3001/versoes/${filtros.modelo}`);
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
      setFiltros(prev => ({ ...prev, versao: '' }));
    }
  }, [filtros.modelo]);

  const fetchAnuncios = async (filtrosAtuais = filtros) => {
    try {
      setLoadingAnuncios(true);
      setError('');
      const anunciosData = await buscarAnuncios(filtrosAtuais);
      setAnuncios(anunciosData);
      // Inicializar os índices das fotos para 0 para cada anúncio carregado
      const indicesIniciais = {};
      anunciosData.forEach(anuncio => {
        indicesIniciais[anuncio.CodAnuncio] = 0;
      });
      setIndicesFotosAtuais(indicesIniciais);
      setPaginaAtual(1);
    } catch (error) {
      console.error('Erro ao buscar anúncios:', error);
      setError(`Falha ao buscar anúncios: ${error.message}`);
      setAnuncios([]);
    } finally {
      setLoadingAnuncios(false);
    }
  };

  // Funções para navegar pelas fotos de um anúncio específico
  const proximaFoto = (codAnuncio, totalFotos) => {
    setIndicesFotosAtuais(prevIndices => ({
      ...prevIndices,
      [codAnuncio]: (prevIndices[codAnuncio] + 1) % totalFotos
    }));
  };

  const fotoAnterior = (codAnuncio, totalFotos) => {
    setIndicesFotosAtuais(prevIndices => ({
      ...prevIndices,
      [codAnuncio]: (prevIndices[codAnuncio] - 1 + totalFotos) % totalFotos
    }));
  };


  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const handleAplicarFiltros = (e) => {
    e.preventDefault();
    fetchAnuncios(filtros);
  };

  const handleLimparFiltros = () => {
    const filtrosZerados = {
      modelo: '',
      versao: '',
      ano: '',
      precoMin: '',
      precoMax: ''
    };
    setFiltros(filtrosZerados);
    fetchAnuncios(filtrosZerados);
  };

  const handleDeleteAnuncio = async (id) => {
    if (window.confirm('Tem certeza que deseja apagar este anúncio?')) {
      try {
        await deletarAnuncio(id);
        setAnuncios(prev => prev.filter(anuncio => anuncio.CodAnuncio !== id));
        // Remover o índice do anúncio deletado do estado
        setIndicesFotosAtuais(prevIndices => {
          const novosIndices = { ...prevIndices };
          delete novosIndices[id];
          return novosIndices;
        });
        alert('Anúncio apagado com sucesso!');
      } catch (error) {
        console.error('Erro no componente ao deletar anúncio:', error);
        alert(`Erro ao apagar anúncio: ${error.message}`);
      }
    }
  };

  const handleDeleteConta = async () => {
    const codPessoaStorage = localStorage.getItem('codPessoa');
    if (window.confirm('ATENÇÃO: Tem certeza que deseja apagar sua conta? Todos os seus anúncios e chats serão perdidos permanentemente.')) {
      if (user && codPessoaStorage) {
        try {
          await deletarPessoa(codPessoaStorage);
          handleLogout();
        } catch (error) {
          console.error('Erro no componente ao deletar conta:', error);
          alert(`Erro ao deletar conta: ${error.message}`);
        }
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('codPessoa');
    localStorage.removeItem('nomePessoa');
    localStorage.removeItem('usuarioPessoa');
    setUser(null);
    navigate('/login');
  };

  const handleSendMessage = async (codDestinatario) => {
    const codRemetente = localStorage.getItem('codPessoa');
    if (!user || !codRemetente) {
      alert('Usuário não autenticado. Faça login novamente.');
      navigate('/login');
      return;
    }
    try {
      console.log('Enviando mensagem de:', codRemetente, 'para:', codDestinatario);
      await enviarMensagem(codRemetente, codDestinatario, "Olá, tenho interesse no seu anúncio!");
      navigate(`/chats/${codDestinatario}`);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Não foi possível iniciar o chat. Tente novamente.');
    }
  };

  const goToCriarAnuncio = () => navigate('/criar-anuncio');
  const goToChats = () => navigate('/chats');
  const goToEditarAnuncio = (idAnuncio) => navigate(`/editar-anuncio/${idAnuncio}`);

  // --- Renderização --- 

  if (loading && !user) {
    return <div className="container text-center mt-5"><p>Carregando dados do usuário...</p></div>;
  }

  if (!loading && !user) {
    return (
      <div className="container text-center mt-5">
        <p className="alert alert-danger">Erro ao carregar dados do usuário: {error || 'Sessão inválida.'}</p>
        <Link to="/login"><button className="btn btn-primary">Ir para Login</button></Link>
      </div>
    );
  }

  const indiceUltimoAnuncio = paginaAtual * itensPorPagina;
  const indicePrimeiroAnuncio = indiceUltimoAnuncio - itensPorPagina;
  const anunciosPagina = anuncios.slice(indicePrimeiroAnuncio, indiceUltimoAnuncio);
  const totalPaginas = Math.ceil(anuncios.length / itensPorPagina);

  return (
    <div className="container menu-container mt-4">
      <header className="menu-header text-center mb-4 p-3 bg-light rounded shadow-sm">
        <h2 className="mb-3">Marketplace CarBuy</h2>
        {user && <h4 className="mb-3">Bem-vindo(a), {user.nome}!</h4>}
        <div className="button-group d-flex justify-content-center flex-wrap gap-2">
          <button onClick={goToCriarAnuncio} className="btn btn-success">Criar Anúncio</button>
          <button onClick={goToChats} className="btn btn-info">Meus Chats</button>
          <button onClick={handleDeleteConta} className="btn btn-danger">Deletar Conta</button>
          <button onClick={handleLogout} className="btn btn-secondary">Sair</button>
        </div>
      </header>

      <section className="filter-section card p-3 mb-4 shadow-sm">
        <h4 className="mb-3 text-center">Filtrar Anúncios</h4>
        <form onSubmit={handleAplicarFiltros} className="filter-controls row g-3 align-items-end">
          {/* ... Controles de filtro ... */}
          <div className="col-md-4 col-sm-6">
            <label htmlFor="modelo" className="form-label">Modelo</label>
            <select id="modelo" name="modelo" value={filtros.modelo} onChange={handleFiltroChange} className="form-select">
              <option value="">Todos</option>
              {modelos.map(m => <option key={m.CodModelo} value={m.CodModelo}>{m.nome}</option>)}
            </select>
          </div>
          <div className="col-md-4 col-sm-6">
            <label htmlFor="versao" className="form-label">Versão</label>
            <select id="versao" name="versao" value={filtros.versao} onChange={handleFiltroChange} disabled={!filtros.modelo || versoes.length === 0} className="form-select">
              <option value="">Todas</option>
              {versoes.map(v => <option key={v.CodVersao} value={v.CodVersao}>{v.nome} ({v.ano})</option>)}
            </select>
          </div>
          <div className="col-md-2 col-sm-6">
            <label htmlFor="ano" className="form-label">Ano</label>
            <input id="ano" type="number" name="ano" placeholder="Ex: 2020" value={filtros.ano} onChange={handleFiltroChange} className="form-control" />
          </div>
          <div className="col-md-3 col-sm-6">
            <label htmlFor="precoMin" className="form-label">Preço Mín.</label>
            <input id="precoMin" type="number" name="precoMin" placeholder="R$" value={filtros.precoMin} onChange={handleFiltroChange} className="form-control" />
          </div>
          <div className="col-md-3 col-sm-6">
            <label htmlFor="precoMax" className="form-label">Preço Máx.</label>
            <input id="precoMax" type="number" name="precoMax" placeholder="R$" value={filtros.precoMax} onChange={handleFiltroChange} className="form-control" />
          </div>
          <div className="col-md-6 col-sm-12 d-flex justify-content-center justify-content-md-start gap-2 mt-3 mt-md-0">
            <button type="submit" className="btn btn-primary">Aplicar Filtros</button>
            <button type="button" onClick={handleLimparFiltros} className="btn btn-secondary">Limpar Filtros</button>
          </div>
        </form>
      </section>

      {error && <p className="alert alert-danger text-center">{error}</p>}

      <section className="mt-4">
        <h3 className="mb-3 text-center">Anúncios Disponíveis</h3>
        {loadingAnuncios ? (
          <div className="text-center"><p>Carregando anúncios...</p></div>
        ) : (
          anuncios.length === 0 ? (
            <p className="text-center text-muted">Nenhum anúncio encontrado com os filtros selecionados.</p>
          ) : (
            <>
              {/* Renderizar a lista de anúncios diretamente aqui */}
              <ul className="anuncios-grid list-unstyled">
                {anunciosPagina.map((anuncio) => {
                  // Determinar a foto atual para este anúncio
                  const fotosDisponiveis = anuncio.fotos && Array.isArray(anuncio.fotos) ? anuncio.fotos : [];
                  const totalFotos = fotosDisponiveis.length;
                  const indiceAtual = indicesFotosAtuais[anuncio.CodAnuncio] || 0;
                  const imagemAtual = totalFotos > 0 ? fotosDisponiveis[indiceAtual]?.linkFoto : '/placeholder.png';

                  return (
                    <li key={anuncio.CodAnuncio} className="anuncio-card card">
                      <div className="anuncio-img-container">
                        <img
                          src={imagemAtual}
                          alt={`${anuncio.nomeModelo} ${anuncio.nomeVersao} - Foto ${indiceAtual + 1}`}
                          className="anuncio-img"
                          onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
                        />
                        {totalFotos > 1 && (
                          <>
                            <button 
                              onClick={(e) => { e.stopPropagation(); fotoAnterior(anuncio.CodAnuncio, totalFotos); }} 
                              className="nav-button prev-button" 
                              aria-label="Foto anterior"
                            >
                              &#10094;
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); proximaFoto(anuncio.CodAnuncio, totalFotos); }} 
                              className="nav-button next-button" 
                              aria-label="Próxima foto"
                            >
                              &#10095;
                            </button>
                            <div className="foto-indicator">{`${indiceAtual + 1} / ${totalFotos}`}</div>
                          </>
                        )}
                      </div>
                      <div className="anuncio-info">
                        <h5>{anuncio.nomeModelo} {anuncio.nomeVersao} ({anuncio.ano})</h5>
                        <p>Vendedor: {anuncio.nomeVendedor}</p>
                        <p className="anuncio-descricao">{anuncio.descricao ? anuncio.descricao.substring(0, 100) + (anuncio.descricao.length > 100 ? '...' : '') : 'Sem descrição.'}</p>
                        <p className="price mt-auto">R$ {parseFloat(anuncio.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                      <div className="anuncio-actions">
                        {user && user.nome === anuncio.nomeVendedor ? (
                          <>
                            <button onClick={() => goToEditarAnuncio(anuncio.CodAnuncio)} className="btn btn-sm edit-button">Editar</button>
                            <button onClick={() => handleDeleteAnuncio(anuncio.CodAnuncio)} className="btn btn-sm delete-button">Apagar</button>
                          </>
                        ) : (
                          user && user.nome !== anuncio.nomeVendedor && (
                            <button onClick={() => handleSendMessage(anuncio.CodPessoa)} className="btn btn-sm message-button">
                              Enviar mensagem
                            </button>
                          )
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Controles de Paginação */} 
              {totalPaginas > 1 && (
                <nav aria-label="Paginação de anúncios" className="d-flex justify-content-center mt-4">
                  <ul className="pagination">
                    <li className={`page-item ${paginaAtual === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setPaginaAtual(p => p - 1)}
                        disabled={paginaAtual === 1}
                      >
                        Anterior
                      </button>
                    </li>
                    <li className="page-item disabled">
                      <span className="page-link">Página {paginaAtual} de {totalPaginas}</span>
                    </li>
                    <li className={`page-item ${paginaAtual === totalPaginas ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setPaginaAtual(p => p + 1)}
                        disabled={paginaAtual === totalPaginas}
                      >
                        Próxima
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )
        )}
      </section>
    </div>
  );
};

export default Menu;

