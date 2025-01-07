/**
 * HomePage.tsx
 *
 * Page d'accueil de l'application :
 * - Présente le jeu BlackJack
 * - Offre un accès rapide au Lobby pour créer ou rejoindre une partie
 * - Design moderne avec une expérience utilisateur soignée
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  /**
   * Redirige vers la page du lobby
   */
  const handleGoToLobby = () => {
    navigate('/lobby');
  };

  return (
    <div className="home-container">
      {/* En-tête */}
      <header className="home-header">
        <h1>🎲 BlackJack Multiplayer 🎲</h1>
        <p className="home-subtitle">Rejoignez la table, défiez vos amis et amusez-vous !</p>
      </header>

      {/* Section d'introduction */}
      <section className="home-intro">
        <p>
          Bienvenue dans le jeu multijoueur de BlackJack en ligne. Créez une partie,
          invitez vos amis ou rejoignez une salle pour une expérience de jeu immersive.
        </p>
      </section>

      {/* Actions principales */}
      <section className="home-actions">
        <button onClick={handleGoToLobby} className="btn-primary">
          🎮 Accéder aux salles de jeu
        </button>
      </section>

      {/* Pied de page */}
      <footer className="home-footer">
        <p>
          Développé avec du ❤️ et beaucoup de ☕
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
