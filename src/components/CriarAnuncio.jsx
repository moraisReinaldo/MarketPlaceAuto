import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { criarAnuncio } from './CRUD/AnuncioCRUD'; // Importa a função refatorada
import '../index.css'; // Estilos globais
import './CSS/CriarAnuncio.css'; // Estilos específicos

const API_URL = 'http://localhost:3001'; // Centralizar URL

const CriarAnuncio = () => {
  const [modelos, setModelos] = useState([]);
  const [versoes, setVersoes] = useState([]);
  const [selectedModelo, setSelectedModelo] = useState('');
  const [form, setForm] = useState({
    valor: '',
    descricao: '',
    codVersao: '',
    fotos: '', // Usaremos string separada por vírgula/nova linha por simplicidade
  });
  const [error, setError] = useState('');
  const [loadingModelos, setLoadingModelos] = useState(true);
  const [loadingVersoes, setLoadingVersoes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para indicar envio

  const navigate = useNavigate();

  // Verifica autenticação e busca modelos ao montar
  useEffect(() => {
    const codPessoa = localStorage.getItem('codPessoa');
    if (!codPessoa) {
      console.log('Usuário não autenticado');
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

  // Busca versões quando um modelo é selecionado
  useEffect(() => {
    if (selectedModelo) {
      const fetchVersoes = async () => {
        try {
          setLoadingVersoes(true);
          setVersoes([]); // Limpa versões anteriores
          setForm(prev => ({ ...prev, codVersao: '' })); // Reseta seleção de versão
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
      setVersoes([]); // Limpa versões se nenhum modelo selecionado
      setForm(prev => ({ ...prev, codVersao: '' })); // Reseta seleção
    }
  }, [selectedModelo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleModeloChange = (e) => {
    setSelectedModelo(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true); // Inicia o estado de envio

    const { valor, descricao, codVersao, fotos } = form;
    const codPessoa = localStorage.getItem('codPessoa'); // Pega o ID do usuário logado

    // Processa a string de fotos em um array de links válidos
    const fotosArray = fotos
      .split(/\s*[\n,]+\s*/) // Separa por vírgula ou nova linha, com espaços opcionais
      .map(link => link.trim()) // Remove espaços extras
      .filter(link => link !== ''); // Remove links vazios

    if (!valor || !descricao || !codVersao || fotosArray.length === 0 || !codPessoa) {
      setError('Todos os campos são obrigatórios, incluindo pelo menos uma foto e estar logado.');
      setIsSubmitting(false);
      return;
    }

    const anuncioData = {
      valor: parseFloat(valor),
      descricao,
      codVersao: parseInt(codVersao, 10),
      codPessoa: parseInt(codPessoa, 10),
      fotos: fotosArray,
    };

    try {
      await criarAnuncio(anuncioData); // Chama a função CRUD refatorada
      alert('Anúncio criado com sucesso!');
      navigate('/menu'); // Ou para a página de meus anúncios
    } catch (err) {
      console.error('Falha ao submeter formulário de criação de anúncio:', err);
      setError(`Erro ao criar anúncio: ${err.message}`);
    } finally {
      setIsSubmitting(false); // Finaliza o estado de envio
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
          
          {/* Coluna 1: Modelo e Versão */}
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

          {/* Coluna Única: Valor */}
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

          {/* Coluna Única: Descrição */}
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

          {/* Coluna Única: Fotos */}
          <div className="col-12">
            <label htmlFor="fotos" className="form-label">Links das Fotos:</label>
            <textarea
              id="fotos"
              name="fotos"
              placeholder="Cole os links das fotos aqui, um por linha ou separados por vírgula"
              value={form.fotos}
              onChange={handleInputChange}
              required
              className="form-control"
              rows="5"
            />
            <div className="form-text">Insira um link por linha ou separe-os por vírgula. A primeira foto será a capa.</div>
          </div>

          {/* Botões */}
          <div className="col-12 d-flex justify-content-between mt-4">
            <Link to="/menu">
              <button type="button" className="btn btn-secondary">Cancelar</button>
            </Link>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || loadingModelos || loadingVersoes}>
              {isSubmitting ? 'Criando...' : 'Criar Anúncio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CriarAnuncio;
