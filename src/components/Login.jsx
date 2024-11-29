import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buscarPessoas } from './CRUD/PessoaCRUD';

const Login = () => {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // Buscar todas as pessoas
      const pessoas = await buscarPessoas();

      // Encontrar a pessoa que corresponde ao usuário e senha
      const pessoa = pessoas.find(
        (p) => p.usuario === usuario && p.senha === senha
      );

      if (pessoa) {
        // Armazenar o codPessoa no localStorage
        localStorage.setItem('codPessoa', pessoa.CodPessoa);
        // Redirecionar para a página de menu
        navigate('/menu');
      } else {
        setError('Usuário ou senha inválidos');
      }
    } catch (err) {
      setError('Erro ao tentar login');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p>{error}</p>}
      <input
        type="text"
        placeholder="Usuário"
        value={usuario}
        onChange={(e) => setUsuario(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        required
      />
      <button onClick={handleLogin}>Entrar</button>
    </div>
  );
};

export default Login;
