import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Inicio from './components/Inicio';
import Menu from './components/Menu';
import CriarAnuncio from './components/CriarAnuncio';
import Register from './components/Register';
import Chats from './components/Chats'; // Importe o componente de Chats

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/criar-anuncio" element={<CriarAnuncio />} />
        <Route path="/chats" element={<Chats />} /> {/* Adicionando rota para chats */}
      </Routes>
    </Router>
  );
};

export default App;
