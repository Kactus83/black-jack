import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import initializeSocket from '../../services/socket';
import { Player } from '../../types/player';
import {
  BlackJackPlayerState,
  GameStartedPayload,
  UpdateGameStatePayload,
} from '../../types/blackjack';
import './GamePage.css';

const GamePage: React.FC = () => {
  const { roomId } = useParams();

  // État pour les joueurs avant le début de la partie
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [blackJackPlayers, setBlackJackPlayers] = useState<BlackJackPlayerState[]>([]);
  const [localIP, setLocalIP] = useState<string | null>(null);

  useEffect(() => {
    let socket: Awaited<ReturnType<typeof initializeSocket>>;

    const setupSocket = async () => {
      socket = await initializeSocket();
      if (!socket.connected) {
        socket.connect();
      }

      socket.on('roomUpdated', (data: { players: Player[] }) => {
        setPlayers(data.players);
      });

      socket.on('gameStarted', (payload: GameStartedPayload) => {
        console.log('Game started:', payload.message);
        setGameStarted(true);
      });

      socket.on('updateGameState', (payload: UpdateGameStatePayload) => {
        console.log('updateGameState:', payload.state);
        setBlackJackPlayers(payload.state);
      });

      fetchLocalIP();
    };

    setupSocket();

    return () => {
      if (socket) {
        socket.off('roomUpdated');
        socket.off('gameStarted');
        socket.off('updateGameState');
      }
    };
  }, []);

  /**
   * Récupère l'adresse IP locale pour affichage
   */
  const fetchLocalIP = async () => {
    try {
      const response = await axios.get('/api/server-info');
      if (response.data.success) {
        setLocalIP(response.data.localIP);
      } else {
        setLocalIP(null);
      }
    } catch (error) {
      console.error('Erreur IP locale:', error);
      setLocalIP(null);
    }
  };

  /**
   * Démarre la partie
   */
  const handleStartGame = async () => {
    if (!roomId) return;
    const socket = await initializeSocket();
    socket.emit('startGame', { roomId }, (response: { success: boolean; error?: string }) => {
      if (!response.success) {
        console.error(response.error);
      }
    });
  };

  /**
   * Actions de jeu : Hit ou Stand
   */
  const handlePlayerAction = async (action: 'hit' | 'stand') => {
    if (!roomId) return;
    const socket = await initializeSocket();
    socket.emit(
      action === 'hit' ? 'playerHit' : 'playerStand',
      { roomId, playerId: 'votre-id-joueur' },
      (response: { success: boolean; error?: string }) => {
        if (!response.success) {
          console.error(response.error);
        }
      }
    );
  };

  return (
    <div className="game-container">
      <h1>BlackJack - Salle {roomId}</h1>

      {!gameStarted && (
        <div className="pre-game">
          <h2>En attente du lancement...</h2>
          <ul className="players-list">
            {players.map((player) => (
              <li key={player.id}>{player.nickname}</li>
            ))}
          </ul>
          <button className="btn-primary" onClick={handleStartGame}>
            Démarrer la Partie
          </button>
          {localIP && <p>Connectez-vous via : {localIP}:3000</p>}
        </div>
      )}

      {gameStarted && (
        <div className="game-board">
          {blackJackPlayers.map((player) => (
            <div key={player.id}>{player.nickname} - Score: {player.score}</div>
          ))}
          <button onClick={() => handlePlayerAction('hit')}>Tirer</button>
          <button onClick={() => handlePlayerAction('stand')}>Rester</button>
        </div>
      )}
    </div>
  );
};

export default GamePage;
