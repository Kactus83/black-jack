import React, { useState } from 'react';
import initializeSocket from '../../services/socket';
import { useNavigate } from 'react-router-dom';
import './LobbyPage.css';

const LobbyPage: React.FC = (): React.ReactElement => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [roomId, setRoomId] = useState('');

  /**
   * Crée une nouvelle partie avec un pseudo
   */
  const handleCreateGame = async () => {
    if (!nickname.trim()) return;

    const socket = await initializeSocket();
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit(
      'createGame',
      { nickname },
      (
        response: {
          success: boolean;
          roomId?: string;
          error?: string;
          playerId?: string; // Ajout pour récupérer le playerId
        }
      ) => {
        if (response.success && response.roomId && response.playerId) {
          // On stocke le playerId localement
          localStorage.setItem('playerId', response.playerId);
          navigate(`/game/${response.roomId}`);
        } else {
          console.error(response.error);
        }
      }
    );
  };

  /**
   * Rejoint une partie existante via un Room ID
   */
  const handleJoinGame = async () => {
    if (!nickname.trim() || !roomId.trim()) return;

    const socket = await initializeSocket();
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit(
      'joinGame',
      { nickname, roomId },
      (
        response: {
          success: boolean;
          error?: string;
          playerId?: string; // Ajout pour récupérer le playerId
        }
      ) => {
        if (response.success && response.playerId) {
          // On stocke le playerId localement
          localStorage.setItem('playerId', response.playerId);
          navigate(`/game/${roomId}`);
        } else {
          console.error(response.error);
        }
      }
    );
  };

  return (
    <div className="lobby-container">
      <h1 className="lobby-title">BlackJack - Salle de jeu</h1>

      {/* Section de création de partie */}
      <div className="lobby-section">
        <h2>Créer une nouvelle partie</h2>
        <input
          type="text"
          placeholder="Entrez votre pseudo"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="lobby-input"
        />
        <button onClick={handleCreateGame} className="btn-primary">
          Créer une partie
        </button>
      </div>

      {/* Séparation visuelle */}
      <div className="divider">OU</div>

      {/* Section de jonction de partie */}
      <div className="lobby-section">
        <h2>Rejoindre une partie existante</h2>
        <input
          type="text"
          placeholder="Entrez votre pseudo"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="lobby-input"
        />
        <input
          type="text"
          placeholder="ID de la partie"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="lobby-input"
        />
        <button onClick={handleJoinGame} className="btn-secondary">
          Rejoindre une partie
        </button>
      </div>
    </div>
  );
};

export default LobbyPage;
