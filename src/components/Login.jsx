import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../index.css';

const Login = () => {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('codPessoa', data.user.id);
        localStorage.setItem('nomePessoa', data.user.nome);
        localStorage.setItem('usuarioPessoa', data.user.usuario);
        navigate('/menu');
      } else {
        setError(data.error || 'Erro ao tentar login. Verifique usuário e senha.');
      }
    } catch (err) {
      console.error('Erro na requisição de login:', err);
      setError('Erro de conexão ao tentar login. Verifique se o servidor está rodando.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4">Login</h2>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="usuario" className="form-label">Usuário:</label>
            <input
              id="usuario"
              type="text"
              className="form-control"
              placeholder="Digite seu usuário"
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
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Entrando...
              </>
            ) : 'Entrar'}
          </button>
        </form>

        <p className="text-center mt-3">
          Não tem uma conta? <Link to="/register">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;