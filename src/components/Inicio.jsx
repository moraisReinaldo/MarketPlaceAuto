import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css'; // Importa os estilos globais modernizados

const Inicio = () => {
  return (
    <div className="container mt-3"> {/* Usa container global e adiciona margem superior */}
      {/* Header Simplificado para a página inicial */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--spacing-unit)', borderBottom: '1px solid var(--light-border)' }}>
        <div className="logo">
          {/* Idealmente, o logo seria um SVG ou um componente reutilizável */}
          <img
            src="https://www.globonissan.com.br/imagens/img_veic/veiculonissan619-2023.png" // Manter a imagem por enquanto
            alt="Logo CarBuy"
            style={{ maxWidth: '150px', height: 'auto' }} // Estilo inline para simplicidade aqui
          />
        </div>
        <nav>
          <Link to="/login">
            {/* Botão usa estilos globais de index.css */}
            <button>Login</button>
          </Link>
          <Link to="/register"> {/* Adicionando link para registro */} 
            <button className="secondary" style={{ marginLeft: 'var(--spacing-unit)' }}>Registrar</button> {/* Botão secundário */} 
          </Link>
        </nav>
      </header>

      {/* Conteúdo Principal Centralizado */}
      <main className="text-center" style={{ padding: 'calc(var(--spacing-unit) * 3) 0' }}>
        <h1>Bem-vindo ao CarBuy!</h1>
        <p style={{ maxWidth: '600px', margin: '0 auto calc(var(--spacing-unit) * 1.5) auto', color: 'var(--secondary-color)' }}>
          Encontre o carro dos seus sonhos em nossa plataforma. Com uma grande variedade de modelos e preços, estamos aqui para ajudá-lo a tomar a melhor decisão de compra.
        </p>
        <Link to="/login">
          <button>Acessar Plataforma</button>
        </Link>
      </main>

      {/* Rodapé Simples */}
      <footer className="text-center" style={{ marginTop: 'auto', paddingTop: 'var(--spacing-unit)', borderTop: '1px solid var(--light-border)', fontSize: '0.9rem', color: 'var(--secondary-color)' }}>
        <p>&copy; {new Date().getFullYear()} CarBuy. Todos os direitos reservados.</p>
      </footer>

      {/* Estilos específicos para modo escuro no header/footer (se necessário) */} 
      <style>{`
        @media (prefers-color-scheme: dark) {
          header, footer {
            border-color: var(--dark-border);
          }
          main p {
             color: var(--dark-text-secondary, var(--secondary-color)); /* Cor secundária para texto no modo escuro */
          }
        }
      `}</style>
    </div>
  );
};

export default Inicio;

