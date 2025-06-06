import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './components/Login';
import Inicio from './components/Inicio';
import Menu from './components/Menu';
import CriarAnuncio from './components/CriarAnuncio';
import Register from './components/Register';
import Chats from './components/Chats';
import EditarAnuncio from './components/EditarAnuncio';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/criar-anuncio" element={<CriarAnuncio />} />
        <Route path="/chats" element={<Chats />} />
        <Route path="/chats/:destinatarioId" element={<Chats />} />
        <Route path="/editar-anuncio/:idAnuncio" element={<EditarAnuncio />} />
        
        <Route path="*" element={
          <div className="container text-center mt-5">
            <h2>404 - Página não encontrada</h2>
            <p>A página que você está procurando não existe.</p>
            <Link to="/" className="btn btn-primary">
              Voltar para a página inicial
            </Link>
          </div>
        } />
      </Routes>
    </Router>
  );
};

export default App; 