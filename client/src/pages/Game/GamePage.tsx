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

/**
 * Page principale de l'interface du jeu de BlackJack.
 * - Gère la connexion Socket.IO pour l'état du jeu.
 * - Affiche la liste des joueurs avant le lancement.
 * - Affiche les cartes (sous forme textuelle stylée) et le score pour chaque joueur.
 * - Propose des actions "Tirer" (Hit) et "Rester" (Stand).
 */
const GamePage: React.FC = () => {
  const { roomId } = useParams();

  // Liste des joueurs avant le lancement
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  // État du jeu (cartes, score) une fois la partie lancée
  const [blackJackPlayers, setBlackJackPlayers] = useState<BlackJackPlayerState[]>([]);

  // Adresse IP locale pour affichage / connexion LAN
  const [localIP, setLocalIP] = useState<string | null>(null);

  /**
   * useEffect : Initialise la connexion socket,
   * écoute les événements clés ("roomUpdated", "gameStarted", "updateGameState").
   */
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
   * Récupère l'adresse IP locale pour l'afficher.
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
   * Démarre la partie : envoie 'startGame' via Socket.IO.
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
   * Actions de jeu : Tirer (Hit) ou Rester (Stand).
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

  /**
   * Retour visuel principal
   */
  return (
    <div className="game-container">
      <h1>BlackJack - Room {roomId}</h1>

      {/* Section avant le lancement */}
      {!gameStarted && (
        <div className="pre-game">
          <h2>Waiting to start...</h2>
          <ul className="players-list">
            {players.map((player) => (
              <li key={player.id}>{player.nickname}</li>
            ))}
          </ul>
          <button className="btn-primary" onClick={handleStartGame}>
            Start Game
          </button>
          {localIP && (
            <p className="local-ip-info">
              LAN Access: <strong>{localIP}:3000</strong>
            </p>
          )}
        </div>
      )}

      {/* Section en cours de jeu */}
      {gameStarted && (
        <div className="game-board">
          {blackJackPlayers.map((player) => (
            <div key={player.id} className="player-card">
              <h3>{player.nickname}</h3>
              <div className="hand">
                {player.hand.map((card, index) => (
                  <div key={index} className="card">
                    {/* Affichage textuel, par ex. "A ♣" ou "10 ♥" */}
                    {card.rank} {renderSuitSymbol(card.suit)}
                  </div>
                ))}
              </div>
              <p className="score">Score: {player.score}</p>
            </div>
          ))}
        </div>
      )}

      {/* Section pour les boutons d'action si la partie est lancée */}
      {gameStarted && (
        <div className="player-actions">
          <button className="btn-action" onClick={() => handlePlayerAction('hit')}>
            Tirer (Hit)
          </button>
          <button className="btn-action" onClick={() => handlePlayerAction('stand')}>
            Rester (Stand)
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Fonction utilitaire pour afficher le symbole de la couleur (suit).
 */
function renderSuitSymbol(suit: string): string {
  switch (suit) {
    case 'HEARTS':
      return '♥';
    case 'DIAMONDS':
      return '♦';
    case 'CLUBS':
      return '♣';
    case 'SPADES':
      return '♠';
    default:
      return '';
  }
}

export default GamePage;
