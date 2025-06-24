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
  const [modeloInput, setModeloInput] = useState('');
  const [versaoInput, setVersaoInput] = useState('');
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
          setVersaoInput('');
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
      setVersaoInput('');
    }
  }, [selectedModelo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleModeloInputChange = (e) => {
    const value = e.target.value;
    setModeloInput(value);
    
    // Encontrar o modelo correspondente ao texto digitado
    const modelo = modelos.find(m => m.nome === value);
    if (modelo) {
      setSelectedModelo(modelo.CodModelo);
    } else {
      setSelectedModelo('');
    }
  };

  const handleVersaoInputChange = (e) => {
    const value = e.target.value;
    setVersaoInput(value);
    
    // Encontrar a versão correspondente ao texto digitado
    const versao = versoes.find(v => v.nome === value);
    if (versao) {
      setForm(prev => ({ ...prev, codVersao: versao.CodVersao }));
    } else {
      setForm(prev => ({ ...prev, codVersao: '' }));
    }
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

    // Verificar se o modelo e versão foram selecionados corretamente
    if (!selectedModelo) {
      setError('Por favor, selecione um modelo válido da lista.');
      setIsSubmitting(false);
      return;
    }

    if (!codVersao) {
      setError('Por favor, selecione uma versão válida da lista.');
      setIsSubmitting(false);
      return;
    }

    if (!valor || !descricao || !ano || !local || fotosValidas.length === 0 || !codPessoa) {
      setError('Todos os campos são obrigatórios, incluindo pelo menos uma foto e estar logado.');
      setIsSubmitting(false);
      return;
    }

    if (fotosValidas.some(url => !isValidUrl(url))) {
      setError('Por favor, insira URLs válidas para as fotos');
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

    console.log("Enviando dados do anúncio:", anuncioData);

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
            <input
              id="modelo"
              list="modeloOptions"
              className="form-control"
              placeholder="Digite ou selecione o modelo"
              value={modeloInput}
              onChange={handleModeloInputChange}
              required
            />
            <datalist id="modeloOptions">
              {modelos.map((modelo) => (
                <option key={modelo.CodModelo} value={modelo.nome} />
              ))}
            </datalist>
          </div>

          <div className="col-md-6">
            <label htmlFor="versao" className="form-label">Versão:</label>
            <input
              id="versao"
              list="versaoOptions"
              className="form-control"
              placeholder="Digite ou selecione a versão"
              value={versaoInput}
              onChange={handleVersaoInputChange}
              disabled={!selectedModelo || loadingVersoes}
              required
            />
            <datalist id="versaoOptions">
              {versoes.map((versao) => (
                <option key={versao.CodVersao} value={versao.nome} />
              ))}
            </datalist>
          </div>

          <div className="col-md-6">
            <label htmlFor="ano" className="form-label">Ano:</label>
            <input
              id="ano"
              type="text"
              name="ano"
              placeholder="Ex: 2020"
              value={form.ano}
              onChange={handleInputChange}
              required
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
            <input
              id="valor"
              type="text"
              name="valor"
              placeholder="Ex: 50000.00"
              value={form.valor}
              onChange={handleInputChange}
              required
              className="form-control"
            />
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
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
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
