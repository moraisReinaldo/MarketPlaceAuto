import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../index.css';

const Register = () => {
  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (!nome || !usuario || !senha) {
      setError('Por favor, preencha todos os campos.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/pessoas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, usuario, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Cadastro realizado com sucesso! Redirecionando para login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.error || 'Erro ao criar usuário. Verifique os dados ou tente outro nome de usuário.');
      }
    } catch (err) {
      console.error('Erro na requisição de registro:', err);
      setError('Erro de conexão ao tentar registrar. Verifique se o servidor está rodando.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card p-4" style={{ maxWidth: '450px', width: '100%' }}>
        <h2 className="text-center mb-4">Cadastro</h2>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" role="alert">
            {success}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label htmlFor="nome" className="form-label">Nome Completo:</label>
            <input
              id="nome"
              type="text"
              className="form-control"
              placeholder="Digite seu nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="usuario" className="form-label">Usuário:</label>
            <input
              id="usuario"
              type="text"
              className="form-control"
              placeholder="Escolha um nome de usuário"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="senha" className="form-label">Senha:</label>
            <input
              id="senha"
              type="password"
              className="form-control"
              placeholder="Crie uma senha segura"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Cadastrando...
              </>
            ) : 'Cadastrar'}
          </button>
        </form>

        <p className="text-center mt-3">
          Já tem uma conta? <Link to="/login">Faça login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;