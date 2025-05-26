import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../index.css'; // Importa os estilos globais modernizados

const Login = () => {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault(); // Previne o recarregamento da página
    setError(''); // Limpa erros anteriores
    try {
      const response = await fetch('http://localhost:3001/login', { // Ajustar URL se necessário
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login bem-sucedido:', data);
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
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}> {/* Centraliza vertical e horizontalmente */}
      <div className="card p-4" style={{ maxWidth: '400px', width: '100%' }}> {/* Usa card global e limita largura */}
        <h2 className="text-center mb-4">Login</h2>
        
        {error && (
          <div className="alert alert-danger" role="alert" style={{ backgroundColor: 'rgba(var(--danger-color-rgb, 220, 53, 69), 0.1)', color: 'var(--danger-color)', border: '1px solid var(--danger-color)', borderRadius: 'var(--border-radius)', padding: 'var(--spacing-unit)', marginBottom: 'var(--spacing-unit)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3"> {/* Usa margem global */}
            <label htmlFor="usuario" className="form-label" style={{ fontWeight: '500', marginBottom: 'calc(var(--spacing-unit) * 0.25)', display: 'block' }}>Usuário:</label>
            <input
              id="usuario"
              type="text"
              className="form-control" /* Classe Bootstrap simulada ou usar estilos globais */
              placeholder="Digite seu usuário"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              style={{ width: '100%' }} /* Garante largura total */
            />
          </div>
          <div className="mb-3">
            <label htmlFor="senha" className="form-label" style={{ fontWeight: '500', marginBottom: 'calc(var(--spacing-unit) * 0.25)', display: 'block' }}>Senha:</label>
            <input
              id="senha"
              type="password"
              className="form-control"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Entrar</button> {/* Botão primário global com largura total */} 
        </form>

        <p className="text-center mt-3" style={{ fontSize: '0.9rem' }}>
          Não tem uma conta? <Link to="/register">Cadastre-se</Link>
        </p>
      </div>
       {/* Estilos específicos inline para alerta (poderiam ir para um CSS) */}
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

export default Login;

