import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; 

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoToLobby = () => {
    navigate('/lobby');
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>BlackJack Multiplayer</h1>
      </header>

      <section className="home-intro">
        <p>
          Connectez-vous avec un pseudo, créez une partie ou rejoignez-en une existante, puis
          lancez la partie pour vous mesurer à vos amis ou d’autres joueurs !
        </p>
      </section>

      <section className="home-actions">
        <button onClick={handleGoToLobby} className="btn-lobby">
          Accéder au Lobby
        </button>
      </section>
    </div>
  );
};

export default HomePage;
