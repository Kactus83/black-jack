import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import socket from '../../services/socket';
import { Player } from '../../types/player';
import {
  BlackJackPlayerState,
  GameStartedPayload,
  UpdateGameStatePayload,
} from '../../types/blackjack';

import './GamePage.css';

const GamePage: React.FC = () => {
  const { roomId } = useParams();

  // Liste simple de joueurs (avant le lancement officiel de la partie)
  const [players, setPlayers] = useState<Player[]>([]);

  // Indique si la partie est déjà lancée
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  // État "BlackJack" : mains, scores...
  const [blackJackPlayers, setBlackJackPlayers] = useState<BlackJackPlayerState[]>([]);

  // Adresse IP locale du serveur (pour se connecter en LAN)
  const [localIP, setLocalIP] = useState<string | null>(null);

  // Au premier rendu :
  //  1) Se connecter au socket si ce n'est pas déjà fait
  //  2) Écouter les events "roomUpdated", "gameStarted", "updateGameState"
  //  3) Charger l'IP locale du serveur
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    // -- Évènements Socket.IO --

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

    // Charger l'IP locale du serveur via l'endpoint /api/server-info
    fetchLocalIP();

    return () => {
      socket.off('roomUpdated');
      socket.off('gameStarted');
      socket.off('updateGameState');
    };
  }, []);

  /**
   * Récupère l'IP locale du serveur pour affichage,
   * afin que d'autres PC du LAN puissent se connecter.
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
      console.error('Erreur lors de la récupération de l\'IP locale:', error);
      setLocalIP(null);
    }
  };

  /**
   * Lance la partie (startGame), ce qui distribue les cartes.
   */
  const handleStartGame = () => {
    if (!roomId) return;
    socket.emit('startGame', { roomId }, (response: { success: boolean; error?: string }) => {
      if (!response.success) {
        console.error(response.error);
      }
    });
  };

  /**
   * Permet, si besoin, de re-demander l'état au serveur.
   * (Normalement inutile mais peut servir a des fin de test/debug)
   */
  const handleRequestState = () => {
    if (!roomId) return;
    socket.emit(
      'requestGameState',
      { roomId },
      (response: { success: boolean; state?: BlackJackPlayerState[]; error?: string }) => {
        if (response.success && response.state) {
          setBlackJackPlayers(response.state);
        } else {
          console.error(response.error);
        }
      }
    );
  };

  return (
    <div className="game-container">
      <h2>Partie : {roomId}</h2>

      {/* Si la partie n'est pas encore lancée, on affiche la liste des joueurs + IP locale */}
      {!gameStarted && (
        <div className="pre-game-section">
          <h3>Joueurs connectés avant le lancement :</h3>
          <ul>
            {players.map((player) => (
              <li key={player.id}>{player.nickname}</li>
            ))}
          </ul>

          {/* Bouton pour lancer la partie */}
          <button onClick={handleStartGame} style={{ marginTop: '20px' }}>
            Lancer la partie
          </button>

          {/* Indicateur d'adresse IP locale (pour se connecter en LAN) */}
          {localIP && (
            <div className="local-ip-info">
              <p>
                Adresse IP locale du serveur : <strong>{localIP}:3000</strong>
              </p>
              <p>
                Utilisez ce format dans un navigateur d'un autre PC du LAN pour accéder à l'application.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Si la partie est lancée, on affiche la distribution (mains) */}
      {gameStarted && (
        <div className="game-started-section">
          <h3>BlackJack en cours</h3>
          <button onClick={handleRequestState} style={{ marginBottom: '10px' }}>
            Rafraîchir l'état
          </button>

          {blackJackPlayers.map((p) => (
            <div key={p.id} className="player-section">
              <h4>{p.nickname}</h4>
              <div className="card-list">
                {p.hand.map((card, index) => (
                  <div className="card-item" key={index}>
                    {/* e.g.: "A of SPADES" */}
                    {card.rank} of {card.suit}
                  </div>
                ))}
              </div>
              <span className="score-label">Score : {p.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GamePage;
