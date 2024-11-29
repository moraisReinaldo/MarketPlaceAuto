import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { criarAnuncio } from './CRUD/AnuncioCRUD';
import './CSS/CriarAnuncio.css'; // Adicionando o CSS para este componente

const CriarAnuncio = () => {
  const [form, setForm] = useState({
    nome: '',
    valor: '',
    desc: '',
    ano: '',
    versao: '',
    linkFoto: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Obtém o CodPessoa do localStorage
    const codPessoa = localStorage.getItem('codPessoa');
    if (!codPessoa) {
      console.log('Usuário não autenticado');
      navigate('/'); // Redireciona para login se não autenticado
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nome, valor, desc, ano, versao, linkFoto } = form;

    // Validação simples antes de enviar
    if (ano < 1900 || ano > new Date().getFullYear()) {
      alert('Insira um ano válido!');
      return;
    }

    try {
      await criarAnuncio(nome, valor, desc, ano, versao, linkFoto); // Envia os dados corretos
      console.log('Anúncio criado com sucesso');
      navigate('/menu');
    } catch (error) {
      console.error('Erro ao criar anúncio:', error);
    }
  };

  return (
    <div className="criar-anuncio-container">
      <h2>Criar Anúncio</h2>
      <form onSubmit={handleSubmit} className="anuncio-form">
        <div className="input-group">
          <input
            type="text"
            name="nome"
            placeholder="Nome"
            value={form.nome}
            onChange={handleInputChange}
            required
            className="input-field"
          />
        </div>
        <div className="input-group">
          <input
            type="number"
            name="valor"
            placeholder="Valor"
            value={form.valor}
            onChange={handleInputChange}
            required
            className="input-field"
          />
        </div>
        <div className="input-group">
          <textarea
            name="desc"
            placeholder="Descrição"
            value={form.desc}
            onChange={handleInputChange}
            required
            className="input-field"
          />
        </div>
        <div className="input-group">
          <input
            type="number"
            name="ano"
            placeholder="Ano"
            value={form.ano}
            onChange={handleInputChange}
            min="1900"
            max={new Date().getFullYear()} // Validação do ano no input
            required
            className="input-field"
          />
        </div>
        <div className="input-group">
          <input
            type="text"
            name="versao"
            placeholder="Versão"
            value={form.versao}
            onChange={handleInputChange}
            required
            className="input-field"
          />
        </div>
        <div className="input-group">
          <input
            type="url"
            name="linkFoto"
            placeholder="Link da Foto"
            value={form.linkFoto}
            onChange={handleInputChange}
            required
            className="input-field"
          />
        </div>
        <button type="submit" className="submit-button">Criar Anúncio</button>
        <Link to="/menu"> <button className="login-btn">Retornar ao menu</button> </Link>
      </form>
    </div>
  );
};

export default CriarAnuncio;
