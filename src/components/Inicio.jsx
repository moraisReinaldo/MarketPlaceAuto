import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css'; // Importando o CSS fornecido

const Inicio = () => {
  return (
    <div className="container">
      {/* Header com logo e navegação */}
      <header className="header">
        <div className="logo">
          <img
            src="https://www.globonissan.com.br/imagens/img_veic/veiculonissan619-2023.png"
            alt="Logo CarBuy"
            className="logo-img"
          />
        </div>
        <nav className="nav">
          <ul>
            <li><Link to="/login"> <button className="login-btn">Login</button> </Link></li>
          </ul>
        </nav>
      </header>

      {/* Descrição e Botão de Login */}
      <main className="main-content">
        <h1>Bem-vindo ao CarBuy!</h1>
        <p>Encontre o carro dos seus sonhos em nossa plataforma. Com uma grande variedade de modelos e preços, estamos aqui para ajudá-lo a tomar a melhor decisão de compra. Faça seu login para acessar todas as funcionalidades do nosso site.</p>
        
        {/* Botão de Login */}
      </main>

      {/* Rodapé */}
      <footer className="footer">
        <p>&copy; 2024 CarBuy. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Inicio;
