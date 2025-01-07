import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/Home/HomePage';
import LobbyPage from './pages/Lobby/LobbyPage';
import GamePage from './pages/Game/GamePage';

const App: React.FC = () => {
  return (
    <Routes>
      {/* Page d'accueil */}
      <Route path="/" element={<HomePage />} />

      {/* Lobby */}
      <Route path="/lobby" element={<LobbyPage />} />

      {/* Salle de jeu */}
      <Route path="/game/:roomId" element={<GamePage />} />

      {/* Redirection si route non définie */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
