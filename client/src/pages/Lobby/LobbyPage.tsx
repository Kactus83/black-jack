import React, { useState } from 'react';
import initializeSocket from '../../services/socket';
import { useNavigate } from 'react-router-dom';
import './LobbyPage.css';

/**
 * LobbyPage : Permet de créer ou rejoindre une partie,
 * et d'afficher la liste des parties actives.
 */
const LobbyPage: React.FC = (): React.ReactElement => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [roomId, setRoomId] = useState('');

  // >>> Ajout : state pour stocker la liste des parties actives
  const [activeGames, setActiveGames] = useState<Array<{
    roomId: string;
    playersCount: number;
    players: { id: string; nickname: string }[];
  }> | null>(null);

  /**
   * Crée une nouvelle partie avec un pseudo.
   * Stocke le playerId et aussi le nickname dans localStorage.
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
          playerId?: string;
        }
      ) => {
        if (response.success && response.roomId && response.playerId) {
          // On stocke le playerId et le nickname
          localStorage.setItem('playerId', response.playerId);
          localStorage.setItem('playerNickname', nickname);

          navigate(`/game/${response.roomId}`);
        } else {
          console.error(response.error);
        }
      }
    );
  };

  /**
   * Rejoint une partie existante via un Room ID.
   * Stocke aussi le nickname et le playerId dans localStorage.
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
          playerId?: string;
        }
      ) => {
        if (response.success && response.playerId) {
          localStorage.setItem('playerId', response.playerId);
          localStorage.setItem('playerNickname', nickname);

          navigate(`/game/${roomId}`);
        } else {
          console.error(response.error);
        }
      }
    );
  };

  /**
   * Récupère la liste des parties actives via Socket.IO.
   */
  const handleFetchActiveGames = async () => {
    try {
      const socket = await initializeSocket();
      if (!socket.connected) {
        socket.connect();
      }

      socket.emit('fetchActiveGames', (response: {
        success: boolean;
        error?: string;
        rooms?: Array<{
          roomId: string;
          playersCount: number;
          players: { id: string; nickname: string }[];
        }>
      }) => {
        if (!response.success) {
          console.error('[Lobby] Erreur fetchActiveGames :', response.error);
          return;
        }
        if (response.rooms) {
          setActiveGames(response.rooms);
        }
      });
    } catch (error) {
      console.error('[Lobby] Erreur lors de la récupération des parties actives :', error);
    }
  };

  /**
   * Permet de rejoindre directement une partie depuis la liste
   */
  const handleJoinFromList = async (selectedRoomId: string) => {
    setRoomId(selectedRoomId);
    await handleJoinGame();
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

      {/* Bouton pour afficher la liste des parties actives */}
      <div className="lobby-section" style={{ marginTop: '20px' }}>
        <h2>Liste des parties actives</h2>
        <button onClick={handleFetchActiveGames} className="btn-secondary">
          Afficher les parties
        </button>

        {/* Si on a chargé activeGames, on les liste */}
        {activeGames && (
          <div style={{ marginTop: '10px' }}>
            {activeGames.length === 0 && <p>Aucune partie active pour le moment.</p>}

            {activeGames.map((game) => (
              <div
                key={game.roomId}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  margin: '8px 0',
                  padding: '8px',
                  background: '#fff',
                  color: '#000',
                }}
              >
                <p>
                  <strong>Room ID :</strong> {game.roomId}
                </p>
                <p>
                  <strong>Joueurs connectés :</strong> {game.playersCount}
                </p>
                <ul style={{ marginLeft: '20px' }}>
                  {game.players.map((p) => (
                    <li key={p.id}>{p.nickname}</li>
                  ))}
                </ul>
                <button
                  className="btn-secondary"
                  onClick={() => handleJoinFromList(game.roomId)}
                  style={{ marginTop: '5px' }}
                >
                  Rejoindre
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LobbyPage;
