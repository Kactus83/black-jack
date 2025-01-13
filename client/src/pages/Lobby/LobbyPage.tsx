import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import initializeSocket from '../../services/socket';
import './LobbyPage.css';

/**
 * LobbyPage : 
 * - Crée ou rejoint une partie (room)
 * - Affiche la liste des parties actives
 */
const LobbyPage: React.FC = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [roomId, setRoomId] = useState('');

  // Liste des rooms actives (chacune contient roomId + playersCount).
  // NOTE: Dans le nouveau backend, la structure renvoyée par "fetchRooms" 
  // est {roomId, playersCount}. Si tu souhaites aussi la liste des joueurs,
  // il faudra adapter le backend pour renvoyer players[].
  const [activeRooms, setActiveRooms] = useState<Array<{
    roomId: string;
    playersCount: number;
    // players?: { id: string; nickname: string }[]; // si besoin plus tard
  }> | null>(null);

  /**
   * Crée une nouvelle room (socket.emit('createRoom', ...)).
   * Stocke le playerId et nickname dans localStorage, puis navigue vers /game/:roomId
   */
  const handleCreateRoom = async () => {
    if (!nickname.trim()) return;

    const socket = await initializeSocket();
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit(
      'createRoom',
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

          // Redirige vers la page de la room
          navigate(`/game/${response.roomId}`);
        } else {
          console.error(response.error);
        }
      }
    );
  };

  /**
   * Rejoint une room existante (socket.emit('joinRoom', ...)).
   * Stocke également le nickname et playerId en localStorage.
   */
  const handleJoinRoom = async () => {
    if (!nickname.trim() || !roomId.trim()) return;

    const socket = await initializeSocket();
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit(
      'joinRoom',
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
   * Récupère la liste des rooms actives via Socket.IO (fetchRooms).
   */
  const handleFetchRooms = async () => {
    try {
      const socket = await initializeSocket();
      if (!socket.connected) {
        socket.connect();
      }

      socket.emit('fetchRooms', (response: {
        success: boolean;
        error?: string;
        rooms?: Array<{
          roomId: string;
          playersCount: number;
        }>
      }) => {
        if (!response.success) {
          console.error('[Lobby] Erreur fetchRooms :', response.error);
          return;
        }
        if (response.rooms) {
          setActiveRooms(response.rooms);
        }
      });
    } catch (error) {
      console.error('[Lobby] Erreur lors de la récupération des rooms actives :', error);
    }
  };

  /**
   * Permet de rejoindre directement une room depuis la liste
   */
  const handleJoinFromList = async (selectedRoomId: string) => {
    setRoomId(selectedRoomId);
    await handleJoinRoom();
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
        <button onClick={handleCreateRoom} className="btn-primary">
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
        <button onClick={handleJoinRoom} className="btn-secondary">
          Rejoindre une partie
        </button>
      </div>

      {/* Bouton pour afficher la liste des parties actives */}
      <div className="lobby-section" style={{ marginTop: '20px' }}>
        <h2>Liste des parties actives</h2>
        <button onClick={handleFetchRooms} className="btn-secondary">
          Afficher les parties
        </button>

        {/* Si on a chargé activeRooms, on les liste */}
        {activeRooms && (
          <div style={{ marginTop: '10px' }}>
            {activeRooms.length === 0 && <p>Aucune partie active pour le moment.</p>}

            {activeRooms.map((game) => (
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
                {/* 
                  NOTE: Si on veut voir la liste des joueurs,
                  il faudra que le backend renvoie "players".
                */}
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
