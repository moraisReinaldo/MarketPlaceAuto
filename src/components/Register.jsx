import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { criarPessoa } from './CRUD/PessoaCRUD';  // Função para criar uma pessoa
import '../index.css'; // Importando o CSS fornecido

const Register = () => {
  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!nome || !usuario || !senha) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      // Criar a pessoa (usuário)
      await criarPessoa(nome, usuario, senha);

      setSuccess('Cadastro realizado com sucesso!');
      // Após cadastro, redireciona o usuário para a tela de login
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('Erro ao criar usuário');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Cadastro</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <input
        type="text"
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
      />
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
      <button onClick={handleRegister}>Cadastrar</button>
    </div>
  );
};

export default Register;
