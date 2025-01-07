import React, { useState } from 'react';
import socket from '../../services/socket';
import { useNavigate } from 'react-router-dom';

const LobbyPage: React.FC = (): React.ReactElement => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleCreateGame = () => {
    if (!nickname.trim()) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit(
      'createGame',
      { nickname },
      (response: { success: boolean; roomId?: string; error?: string }) => {
        if (response.success && response.roomId) {
          navigate(`/game/${response.roomId}`);
        } else {
          console.error(response.error);
        }
      }
    );
  };

  const handleJoinGame = () => {
    if (!nickname.trim() || !roomId.trim()) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit(
      'joinGame',
      { nickname, roomId },
      (response: { success: boolean; error?: string }) => {
        if (response.success) {
          navigate(`/game/${roomId}`);
        } else {
          console.error(response.error);
        }
      }
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Lobby</h2>
      <div>
        <label>Pseudo :</label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      </div>

      <div style={{ marginTop: '10px' }}>
        <button onClick={handleCreateGame}>Créer une partie</button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <label>ID Partie :</label>
        <input
          type="text"
          placeholder="Entrez l'ID de la partie"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button onClick={handleJoinGame}>Rejoindre</button>
      </div>
    </div>
  );
};

export default LobbyPage;
