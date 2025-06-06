import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { criarAnuncio } from './CRUD/AnuncioCRUD';
import '../index.css';
import './CSS/CriarAnuncio.css';

const API_URL = 'http://localhost:3001';

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const CriarAnuncio = () => {
  const [modelos, setModelos] = useState([]);
  const [versoes, setVersoes] = useState([]);
  const [selectedModelo, setSelectedModelo] = useState('');
  const [form, setForm] = useState({
    valor: '',
    descricao: '',
    codVersao: '',
    ano: '',
    local: '',
  });
  const [fotos, setFotos] = useState(['']);
  const [error, setError] = useState('');
  const [loadingModelos, setLoadingModelos] = useState(true);
  const [loadingVersoes, setLoadingVersoes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const codPessoa = localStorage.getItem('codPessoa');
    if (!codPessoa) {
      alert('Você precisa estar logado para criar anúncios.');
      navigate('/login');
      return;
    }

    const fetchModelos = async () => {
      try {
        setLoadingModelos(true);
        const response = await fetch(`${API_URL}/modelos`);
        if (!response.ok) throw new Error('Erro ao buscar modelos');
        const data = await response.json();
        setModelos(data);
      } catch (err) {
        console.error(err);
        setError('Falha ao carregar modelos de veículos.');
      } finally {
        setLoadingModelos(false);
      }
    };

    fetchModelos();
  }, [navigate]);

  useEffect(() => {
    if (selectedModelo) {
      const fetchVersoes = async () => {
        try {
          setLoadingVersoes(true);
          setVersoes([]);
          setForm(prev => ({ ...prev, codVersao: '' }));
          const response = await fetch(`${API_URL}/versoes/${selectedModelo}`);
          if (!response.ok) throw new Error('Erro ao buscar versões');
          const data = await response.json();
          setVersoes(data);
        } catch (err) {
          console.error(err);
          setError('Falha ao carregar versões do modelo selecionado.');
        } finally {
          setLoadingVersoes(false);
        }
      };
      fetchVersoes();
    } else {
      setVersoes([]);
      setForm(prev => ({ ...prev, codVersao: '' }));
    }
  }, [selectedModelo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleModeloChange = (e) => {
    setSelectedModelo(e.target.value);
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
    const novasFotos = [...fotos];
    novasFotos.splice(index, 1);
    setFotos(novasFotos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const { valor, descricao, codVersao, ano, local } = form;
    const codPessoa = localStorage.getItem('codPessoa');

    const fotosValidas = fotos.map(link => link.trim()).filter(link => link !== '');

    if (!valor || !descricao || !codVersao || !ano || !local || fotosValidas.length === 0 || !codPessoa) {
      setError('Todos os campos são obrigatórios, incluindo pelo menos uma foto e estar logado.');
      setIsSubmitting(false);
      return;
    }

    if (fotosValidas.some(url => !isValidUrl(url))) {
      setError('Por favor, insira URLs válidas para as fotos');
      setIsSubmitting(false);
      return;
    }

    if (parseInt(ano) < 1900 || parseInt(ano) > new Date().getFullYear() + 1) {
      setError('Por favor, insira um ano válido');
      setIsSubmitting(false);
      return;
    }

    const anuncioData = {
      valor: parseFloat(valor),
      descricao,
      codVersao: parseInt(codVersao, 10),
      codPessoa: parseInt(codPessoa, 10),
      ano: parseInt(ano, 10),
      local,
      fotos: fotosValidas,
    };

    try {
      await criarAnuncio(anuncioData);
      alert('Anúncio criado com sucesso!');
      navigate('/menu');
    } catch (err) {
      console.error('Falha ao submeter formulário de criação de anúncio:', err);
      setError(`Erro ao criar anúncio: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card p-4 shadow-sm" style={{ maxWidth: '700px', margin: 'auto' }}>
        <h2 className="text-center mb-4">Criar Novo Anúncio</h2>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-6">
            <label htmlFor="modelo" className="form-label">Modelo:</label>
            <select
              id="modelo"
              name="modelo"
              value={selectedModelo}
              onChange={handleModeloChange}
              required
              className="form-select"
              disabled={loadingModelos}
            >
              <option value="">{loadingModelos ? 'Carregando...' : 'Selecione o Modelo'}</option>
              {modelos.map((modelo) => (
                <option key={modelo.CodModelo} value={modelo.CodModelo}>
                  {modelo.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label htmlFor="codVersao" className="form-label">Versão:</label>
            <select
              id="codVersao"
              name="codVersao"
              value={form.codVersao}
              onChange={handleInputChange}
              required
              className="form-select"
              disabled={!selectedModelo || loadingVersoes}
            >
              <option value="">{loadingVersoes ? 'Carregando...' : (selectedModelo ? 'Selecione a Versão' : 'Selecione um modelo')}</option>
              {versoes.map((versao) => (
                <option key={versao.CodVersao} value={versao.CodVersao}>
                  {versao.nome} ({versao.ano})
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label htmlFor="ano" className="form-label">Ano:</label>
            <input
              id="ano"
              type="number"
              name="ano"
              placeholder="Ex: 2020"
              value={form.ano}
              onChange={handleInputChange}
              required
              min="1900"
              max={new Date().getFullYear() + 1}
              className="form-control"
            />
          </div>

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

          <div className="col-12">
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
                  required
                />
                {fotos.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => removerCampoFoto(index)}
                  >
                    Remover
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={adicionarCampoFoto}
            >
              Adicionar Foto
            </button>
            <div className="form-text">A primeira foto será usada como capa.</div>
          </div>

          <div className="col-12 d-flex justify-content-between mt-4">
            <Link to="/menu">
              <button type="button" className="btn btn-secondary">Cancelar</button>
            </Link>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || loadingModelos || loadingVersoes}>
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Criando...
                </>
              ) : 'Criar Anúncio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CriarAnuncio;