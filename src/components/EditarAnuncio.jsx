
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { buscarAnuncioPorId, editarAnuncio } from './CRUD/AnuncioCRUD.jsx';
import '../index.css';
import './CSS/CriarAnuncio.css'; // Reutilizar estilos

const API_URL = 'http://localhost:3001';

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const EditarAnuncio = () => {
  const { idAnuncio } = useParams();
  const navigate = useNavigate();
  const [anuncio, setAnuncio] = useState(null); // Armazena dados originais do anúncio
  const [versoesDisponiveis, setVersoesDisponiveis] = useState([]);
  const [form, setForm] = useState({
    valor: '',
    descricao: '',
    ano: '',
    local: '',
    codVersao: '', // Adicionar codVersao ao estado do formulário
  });
  const [fotos, setFotos] = useState(['']);
  const [loading, setLoading] = useState(true);
  const [loadingVersoes, setLoadingVersoes] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar dados do anúncio e versões do modelo
  useEffect(() => {
    const fetchAnuncioEVersoes = async () => {
      try {
        setLoading(true);
        setLoadingVersoes(true);
        setError('');
        
        // 1. Buscar dados do anúncio
        const data = await buscarAnuncioPorId(idAnuncio);
        if (!data) {
          throw new Error('Anúncio não encontrado.');
        }
        setAnuncio(data);
        setForm({
          valor: data.valor || '',
          descricao: data.descricao || '',
          ano: data.ano || '', // Preencher ano
          local: data.local || '', // Preencher local
          codVersao: data.CodVersao || '', // Preencher codVersao
        });
        setFotos(data.fotos && data.fotos.length > 0 ? data.fotos.map(f => f.linkFoto) : ['']);
        setLoading(false);

        // 2. Buscar versões disponíveis para o modelo do anúncio
        if (data.CodModelo) {
          const responseVersoes = await fetch(`${API_URL}/versoes/${data.CodModelo}`);
          if (!responseVersoes.ok) throw new Error('Erro ao buscar versões para este modelo.');
          const versoesData = await responseVersoes.json();
          setVersoesDisponiveis(versoesData);
        } else {
           setVersoesDisponiveis([]); // Caso não tenha CodModelo (improvável)
        }

      } catch (err) {
        console.error('Erro ao buscar dados para edição:', err);
        setError(`Falha ao carregar dados: ${err.message}`);
        setAnuncio(null);
        setLoading(false);
      } finally {
        setLoadingVersoes(false);
      }
    };

    fetchAnuncioEVersoes();
  }, [idAnuncio]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleFotoChange = (index, value) => {
    const novasFotos = [...fotos];
    novasFotos[index] = value;
    setFotos(novasFotos);
  };

  const adicionarCampoFoto = () => {
    setFotos([...fotos, '']);
  };

  const removerCampoFoto = (index) => {
    if (fotos.length <= 1) return;
    const novasFotos = [...fotos];
    novasFotos.splice(index, 1);
    setFotos(novasFotos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Incluir ano, local e codVersao na desestruturação
    const { valor, descricao, ano, local, codVersao } = form;
    const fotosValidas = fotos.map(link => link.trim()).filter(link => link !== '');

    // Validar todos os campos obrigatórios
    if (!valor || !descricao || !ano || !local || !codVersao || fotosValidas.length === 0) {
      setError('Todos os campos (Valor, Descrição, Ano, Localização, Versão) e pelo menos uma foto são obrigatórios.');
      setIsSubmitting(false);
      return;
    }

    // Validar ano
    if (isNaN(parseInt(ano)) || parseInt(ano) < 1900 || parseInt(ano) > new Date().getFullYear() + 2) {
        setError('Ano inválido.');
        setIsSubmitting(false);
        return;
    }

    if (fotosValidas.some(url => !isValidUrl(url))) {
      setError('Por favor, insira URLs válidas para as fotos.');
      setIsSubmitting(false);
      return;
    }

    // Incluir todos os campos no objeto de atualização
    const dadosUpdate = {
      valor: parseFloat(valor),
      descricao,
      ano: parseInt(ano),
      local,
      codVersao: parseInt(codVersao),
      fotos: fotosValidas,
    };

    try {
      await editarAnuncio(idAnuncio, dadosUpdate);
      alert('Anúncio atualizado com sucesso!');
      navigate('/menu');
    } catch (err) {
      console.error('Falha ao submeter formulário de edição de anúncio:', err);
      setError(`Erro ao atualizar anúncio: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Renderização ---

  if (loading) {
    return <div className="container text-center mt-5"><p>Carregando dados do anúncio...</p></div>;
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">{error}</div>
        <Link to="/menu"><button type="button" className="btn btn-secondary">Voltar ao Menu</button></Link>
      </div>
    );
  }

  if (!anuncio) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning" role="alert">Não foi possível carregar os dados do anúncio.</div>
        <Link to="/menu"><button type="button" className="btn btn-secondary">Voltar ao Menu</button></Link>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card p-4 shadow-sm" style={{ maxWidth: '700px', margin: 'auto' }}>
        <h2 className="text-center mb-4">Editar Anúncio</h2>
        {/* Exibir o modelo como referência, já que não é editável diretamente aqui */} 
        <h5 className="text-center text-muted mb-3">Modelo: {anuncio.nomeModelo}</h5>

        {error && (
          <div className="alert alert-danger" role="alert">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="row g-3">
          {/* Campos Editáveis */}
          
          {/* Versão (Dropdown) */}
          <div className="col-md-6">
            <label htmlFor="codVersao" className="form-label">Versão:</label>
            <select
              id="codVersao"
              name="codVersao"
              value={form.codVersao}
              onChange={handleInputChange}
              required
              className="form-select"
              disabled={loadingVersoes}
            >
              <option value="">{loadingVersoes ? 'Carregando...' : 'Selecione a Versão'}</option>
              {versoesDisponiveis.map((versao) => (
                <option key={versao.CodVersao} value={versao.CodVersao}>
                  {/* Exibe nome e ano de referência da versão */} 
                  {versao.nome} {versao.ano ? `(${versao.ano})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Ano (Input numérico) */}
          <div className="col-md-6">
            <label htmlFor="ano" className="form-label">Ano do Veículo:</label>
            <input
              id="ano"
              type="number"
              name="ano"
              placeholder="Ex: 2020"
              value={form.ano}
              onChange={handleInputChange}
              required
              min="1900"
              max={new Date().getFullYear() + 2}
              className="form-control"
            />
          </div>

          {/* Localização (Input texto) */}
          <div className="col-md-6">
            <label htmlFor="local" className="form-label">Localização:</label>
            <input
              id="local"
              type="text"
              name="local"
              placeholder="Ex: São Paulo, SP"
              value={form.local}
              onChange={handleInputChange}
              required
              className="form-control"
            />
          </div>

          {/* Valor (Input numérico) */}
          <div className="col-md-6">
            <label htmlFor="valor" className="form-label">Valor (R$):</label>
            <div className="input-group">
              <span className="input-group-text">R$</span>
              <input
                id="valor"
                type="number"
                name="valor"
                placeholder="Ex: 50000.00"
                value={form.valor}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
                className="form-control"
              />
            </div>
          </div>

          {/* Descrição (Textarea) */}
          <div className="col-12">
            <label htmlFor="descricao" className="form-label">Descrição:</label>
            <textarea
              id="descricao"
              name="descricao"
              placeholder="Descreva o veículo, estado de conservação, opcionais, etc."
              value={form.descricao}
              onChange={handleInputChange}
              required
              className="form-control"
              rows="4"
            />
          </div>

          {/* Fotos (Inputs texto) */}
          <div className="col-12">
            <label className="form-label">Links das Fotos:</label>
            {fotos.map((foto, index) => (
              <div key={index} className="input-group mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder={`Link da Foto ${index + 1}`}
                  value={foto}
                  onChange={(e) => handleFotoChange(index, e.target.value)}
                  required={index === 0} // Apenas a primeira foto é obrigatória?
                />
                {fotos.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => removerCampoFoto(index)}
                    title="Remover Foto"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary btn-sm mt-2"
              onClick={adicionarCampoFoto}
            >
              Adicionar Foto
            </button>
            <div className="form-text">A primeira foto será usada como capa. Insira links válidos.</div>
          </div>

          {/* Botões de Ação */}
          <div className="col-12 d-flex justify-content-between mt-4">
            <Link to="/menu">
              <button type="button" className="btn btn-secondary">Cancelar</button>
            </Link>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || loading || loadingVersoes}>
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Salvando...
                </>
              ) : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarAnuncio;

