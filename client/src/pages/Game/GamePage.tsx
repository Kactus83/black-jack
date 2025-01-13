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
 * Structure interne pour représenter un joueur local.
 * (Celui créé depuis la Lobby OU ajouté sur place.)
 */
type LocalPlayer = {
  nickname: string;
  playerId: string;
};

/**
 * Page principale de l'interface du jeu de BlackJack.
 * - Gère la connexion Socket.IO pour l'état du jeu.
 * - Affiche la liste des joueurs avant le lancement.
 * - Affiche cartes / score pour chaque joueur.
 * - Multi-joueurs locaux : un select permet de choisir qui agit (Hit/Stand).
 */
const GamePage: React.FC = () => {
  const { roomId } = useParams();

  // Liste des joueurs avant le lancement (envoyée par "roomUpdated")
  const [players, setPlayers] = useState<Player[]>([]);

  // Indique si la partie est démarrée
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  // État du jeu (cartes, scores) une fois la partie lancée
  const [blackJackPlayers, setBlackJackPlayers] = useState<BlackJackPlayerState[]>([]);

  // Adresse IP locale (pour usage LAN)
  const [localIP, setLocalIP] = useState<string | null>(null);

  // Partie terminée ?
  const [gameOver, setGameOver] = useState<boolean>(false);

  // Liste des gagnants si la partie est finie
  const [winners, setWinners] = useState<string[]>([]);

  /**
   * Liste de joueurs locaux => (playerId + nickname).
   * On y insère :
   * 1) Le premier joueur (créé depuis la lobby).
   * 2) Les joueurs ajoutés manuellement.
   */
  const [localPlayers, setLocalPlayers] = useState<LocalPlayer[]>([]);

  /**
   * Joueur local "actif" pour Hit/Stand.
   */
  const [currentLocalPlayerId, setCurrentLocalPlayerId] = useState<string | null>(null);

  /**
   * Champ de saisie pour ajouter un nouveau joueur local.
   */
  const [newLocalNickname, setNewLocalNickname] = useState('');

  /**
   * Au montage :
   * - Initialise le socket
   * - Ajoute un listener "roomUpdated"
   * - Ajoute un listener "gameStarted", "updateGameState"
   * - Récupère l'IP locale
   * - Ajoute le premier joueur (lobby) dans localPlayers
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

        // Check si la partie est terminée
        const anyIsGameOver = payload.state.some((p) => p.isGameOver);
        setGameOver(anyIsGameOver);

        // Si fin de partie, on détermine les winners
        if (anyIsGameOver) {
          const winnersList = payload.state
            .filter((p) => !p.isBusted)
            .map((p) => p.nickname);
          setWinners(winnersList);
        }
      });

      // Récupérer l'IP locale
      fetchLocalIP();

      // Ajouter le premier joueur (issu de la Lobby) à localPlayers
      initLocalFirstPlayer();
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
   * Récupère le playerId / nickname du localStorage
   * et l'ajoute comme premier "localPlayer" si ce n'est pas déjà fait.
   */
  function initLocalFirstPlayer() {
    const storedId = localStorage.getItem('playerId');
    const storedNick = localStorage.getItem('playerNickname');

    if (storedId && storedNick) {
      const alreadyExist = localPlayers.some((lp) => lp.playerId === storedId);
      if (!alreadyExist) {
        const lp: LocalPlayer = {
          nickname: storedNick,
          playerId: storedId,
        };
        setLocalPlayers((prev) => [...prev, lp]);

        // On définit ce joueur comme actif par défaut
        setCurrentLocalPlayerId(storedId);
      }
    }
  }

  /**
   * Récupère l'adresse IP locale pour affichage (usage LAN).
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
   * Lance la partie (startGame).
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
   * Actions de jeu : "Tirer (Hit)" ou "Rester (Stand)"
   */
  const handlePlayerAction = async (action: 'hit' | 'stand') => {
    if (!roomId || gameOver) return;

    if (!currentLocalPlayerId) {
      console.error('Aucun joueur local sélectionné !');
      return;
    }

    const socket = await initializeSocket();
    socket.emit(
      action === 'hit' ? 'playerHit' : 'playerStand',
      { roomId, playerId: currentLocalPlayerId },
      (response: { success: boolean; error?: string }) => {
        if (!response.success) {
          console.error(response.error);
        }
      }
    );
  };

  /**
   * Ajoute un "nouveau joueur local" (même machine, même front).
   * Appelle joinGame => le serveur renvoie un nouveau playerId.
   */
  const handleAddLocalPlayer = async () => {
    if (!roomId) return;
    if (!newLocalNickname.trim()) return;

    const socket = await initializeSocket();
    socket.emit(
      'joinGame',
      { nickname: newLocalNickname, roomId },
      (response: { success: boolean; error?: string; playerId?: string }) => {
        if (!response.success || !response.playerId) {
          console.error(response.error);
          return;
        }

        const localPlayer: LocalPlayer = {
          nickname: newLocalNickname,
          playerId: response.playerId,
        };
        setLocalPlayers((prev) => [...prev, localPlayer]);

        // Reset de l'input
        setNewLocalNickname('');

        // On sélectionne ce nouveau joueur local comme actif
        setCurrentLocalPlayerId(response.playerId);
      }
    );
  };

  /**
   * Affiche le symbole de la couleur (suit).
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

  return (
    // Ajout de "blackjack-background" pour un rendu plus immersif
    <div className="game-container blackjack-background">
      <h1>BlackJack - Room {roomId}</h1>

      {/* SECTION AVANT LE LANCEMENT */}
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

          {/* AJOUT / AFFICHAGE DES JOUEURS LOCAUX */}
          <div className="add-local-player-section">
            <h3>Ajouter un joueur local</h3>
            <input
              type="text"
              placeholder="Pseudo local"
              value={newLocalNickname}
              onChange={(e) => setNewLocalNickname(e.target.value)}
              className="form-input"
            />
            <button onClick={handleAddLocalPlayer} className="btn-secondary" style={{ marginLeft: '10px' }}>
              Ajouter
            </button>

            <div style={{ marginTop: '10px', textAlign: 'left' }}>
              {localPlayers.length > 0 && <p>Joueurs locaux ajoutés :</p>}
              <ul>
                {localPlayers.map((lp) => (
                  <li key={lp.playerId}>
                    {lp.nickname} (ID: {lp.playerId})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SECTION EN COURS DE PARTIE */}
      {gameStarted && !gameOver && (
        <div className="game-board">
          {blackJackPlayers.map((player) => (
            <div
              key={player.id}
              className={
                'player-card' +
                (player.isCurrent ? ' is-current' : '') +
                (player.isBusted ? ' is-busted' : '')
              }
            >
              <h3>{player.nickname}</h3>
              <div className="chips-info">
                <p>Chips: {player.chips}</p>
                <p>Bet: {player.bet}</p>
              </div>
              <div className="hand">
                {player.hand.map((card, index) => (
                  <div key={index} className="card">
                    {card.rank} {renderSuitSymbol(card.suit)}
                  </div>
                ))}
              </div>

              {player.isBusted && <p className="status-tag bust-tag">BUST</p>}
              {player.hasStood && !player.isBusted && <p className="status-tag stand-tag">STAND</p>}

              <p className="score">Score: {player.score}</p>

              {player.isCurrent && (
                <p className="status-info">C'est le tour de {player.nickname} !</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SECTION GAME OVER */}
      {gameStarted && gameOver && (
        <div className="game-over-section">
          <h2>Game Over</h2>
          {winners.length > 0 ? (
            <p>
              Gagnant(s) : {winners.join(', ')}
            </p>
          ) : (
            <p>Aucun gagnant... (tout le monde bust)</p>
          )}

          <div className="game-board">
            {blackJackPlayers.map((player) => (
              <div
                key={player.id}
                className={'player-card' + (player.isBusted ? ' is-busted' : '')}
              >
                <h3>{player.nickname}</h3>
                <div className="hand">
                  {player.hand.map((card, index) => (
                    <div key={index} className="card">
                      {card.rank} {renderSuitSymbol(card.suit)}
                    </div>
                  ))}
                </div>
                {player.isBusted && <p className="status-tag bust-tag">BUST</p>}
                {player.hasStood && !player.isBusted && <p className="status-tag stand-tag">STAND</p>}

                <p className="score">Score: {player.score}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION POUR LES ACTIONS HIT/STAND, si la partie est en cours */}
      {gameStarted && !gameOver && (
        <div className="player-actions">
          <div style={{ marginBottom: '10px' }}>
            <label style={{ marginRight: '8px', fontWeight: 'bold' }}>
              Joueur local actif :
            </label>
            <select
              value={currentLocalPlayerId || ''}
              onChange={(e) => setCurrentLocalPlayerId(e.target.value)}
              className="form-select"
            >
              <option value="">-- Sélectionner --</option>
              {localPlayers.map((lp) => (
                <option key={lp.playerId} value={lp.playerId}>
                  {lp.nickname}
                </option>
              ))}
            </select>
          </div>

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

export default GamePage;
