import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../index.css'; // Importa os estilos globais modernizados

const Register = () => {
  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault(); // Previne o recarregamento da página
    setError('');
    setSuccess('');

    if (!nome || !usuario || !senha) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/pessoas', { // Ajustar URL se necessário
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
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card p-4" style={{ maxWidth: '450px', width: '100%' }}> {/* Card um pouco maior para cadastro */}
        <h2 className="text-center mb-4">Cadastro</h2>

        {error && (
          <div className="alert alert-danger" role="alert" style={{ backgroundColor: 'rgba(var(--danger-color-rgb, 220, 53, 69), 0.1)', color: 'var(--danger-color)', border: '1px solid var(--danger-color)', borderRadius: 'var(--border-radius)', padding: 'var(--spacing-unit)', marginBottom: 'var(--spacing-unit)' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" role="alert" style={{ backgroundColor: 'rgba(var(--success-color-rgb, 40, 167, 69), 0.1)', color: 'var(--success-color)', border: '1px solid var(--success-color)', borderRadius: 'var(--border-radius)', padding: 'var(--spacing-unit)', marginBottom: 'var(--spacing-unit)' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label htmlFor="nome" className="form-label" style={{ fontWeight: '500', marginBottom: 'calc(var(--spacing-unit) * 0.25)', display: 'block' }}>Nome Completo:</label>
            <input
              id="nome"
              type="text"
              className="form-control"
              placeholder="Digite seu nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="usuario" className="form-label" style={{ fontWeight: '500', marginBottom: 'calc(var(--spacing-unit) * 0.25)', display: 'block' }}>Usuário:</label>
            <input
              id="usuario"
              type="text"
              className="form-control"
              placeholder="Escolha um nome de usuário"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="senha" className="form-label" style={{ fontWeight: '500', marginBottom: 'calc(var(--spacing-unit) * 0.25)', display: 'block' }}>Senha:</label>
            <input
              id="senha"
              type="password"
              className="form-control"
              placeholder="Crie uma senha segura"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Cadastrar</button>
        </form>

        <p className="text-center mt-3" style={{ fontSize: '0.9rem' }}>
          Já tem uma conta? <Link to="/login">Faça login</Link>
        </p>
      </div>
      {/* Estilos específicos inline (poderiam ir para um CSS) */}
      <style>{`
        .d-flex { display: flex !important; }
        .justify-content-center { justify-content: center !important; }
        .align-items-center { align-items: center !important; }
        .p-4 { padding: calc(var(--spacing-unit) * 1.5) !important; }
        .mb-4 { margin-bottom: calc(var(--spacing-unit) * 1.5) !important; }
        .w-100 { width: 100% !important; }
        .btn { /* Estilo base para botões se não usar framework */
            display: inline-block;
            font-weight: 400;
            line-height: 1.6;
            text-align: center;
            vertical-align: middle;
            cursor: pointer;
            user-select: none;
            border: 1px solid transparent;
            padding: calc(var(--spacing-unit) * 0.375) calc(var(--spacing-unit) * 0.75);
            font-size: 1rem;
            border-radius: var(--border-radius);
            transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        .btn-primary {
            color: #fff;
            background-color: var(--primary-color);
            border-color: var(--primary-color);
        }
        .btn-primary:hover {
            filter: brightness(0.9);
        }
       `}</style>
    </div>
  );
};

export default Register;

