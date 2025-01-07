import express, { Request, Response } from 'express';
import http from 'http';
import os from 'os'; 
import { Server } from 'socket.io';
import GameRoomManager from './services/GameRoomManager';
import BlackJackService from './services/BlackJackService';

/**
 * Fichier principal du serveur Express + Socket.IO.
 * Gère la création et la jonction de partie, ainsi que le BlackjackService.
 * + Route pour exposer l'IP locale (pour connexion sur le LAN).
 */

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Parser le JSON 
app.use(express.json());

/**
 * Fonction utilitaire pour récupérer l'adresse IPv4 locale (non interne).
 * On renverra la première qu'on trouve.
 */
function getLocalIPv4Address(): string | null {
  const networkInterfaces = os.networkInterfaces();

  for (const ifaceName of Object.keys(networkInterfaces)) {
    const iface = networkInterfaces[ifaceName];
    if (!iface) continue;

    for (const addr of iface) {
      // Si c'est IPv4, non interne, on le renvoie
      if (addr.family === 'IPv4' && !addr.internal) {
        return addr.address;
      }
    }
  }
  return null;
}

/**
 * Endpoint permettant de récupérer quelques informations sur le serveur,
 * notamment l'adresse IP locale, pour un usage en LAN.
 */
app.get('/api/server-info', (req: express.Request, res: express.Response): void => {
  console.log('[API] Requête reçue sur /api/server-info');
  try {
    const localIP = getLocalIPv4Address();

    if (!localIP) {
      console.warn('[API] Aucune adresse IP locale trouvée');
      res.status(500).json({
        success: false,
        message: 'Impossible de détecter une adresse IP locale',
      });
      return;
    }

    console.log(`[API] Adresse IP locale détectée : ${localIP}`);
    res.status(200).json({
      success: true,
      localIP,
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération de l\'IP locale :', error.message);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération de l\'IP locale',
    });
  }
});

// Endpoint racine
app.get('/', (req, res) => {
  res.send('Hello from server!');
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // CREATE GAME
  socket.on('createGame', (data, callback) => {
    try {
      const { nickname } = data;
      if (!nickname) {
        callback({ success: false, error: 'Nickname is required' });
        return;
      }
      const { roomId } = GameRoomManager.getInstance().createRoom(nickname);

      socket.join(roomId);

      const room = GameRoomManager.getInstance().getRoom(roomId);
      if (room) {
        io.to(roomId).emit('roomUpdated', { players: room.players });
      }

      callback({ success: true, roomId });
    } catch (err: any) {
      callback({ success: false, error: err.message });
    }
  });

  // JOIN GAME
  socket.on('joinGame', (data, callback) => {
    try {
      const { nickname, roomId } = data;
      if (!nickname || !roomId) {
        callback({ success: false, error: 'Nickname and roomId are required' });
        return;
      }
      const result = GameRoomManager.getInstance().joinRoom(roomId, nickname);
      if (!result.success) {
        callback({ success: false, error: result.error });
        return;
      }

      socket.join(roomId);

      const room = GameRoomManager.getInstance().getRoom(roomId);
      if (room) {
        io.to(roomId).emit('roomUpdated', { players: room.players });
      }

      callback({ success: true });
    } catch (err: any) {
      callback({ success: false, error: err.message });
    }
  });

  // START GAME
  socket.on('startGame', (data, callback) => {
    try {
      const { roomId } = data;
      if (!roomId) {
        callback({ success: false, error: 'roomId is required' });
        return;
      }

      const result = BlackJackService.startGame(roomId);
      if (!result.success) {
        callback({ success: false, error: result.error });
        return;
      }

      // Notifier tous les joueurs que la partie commence
      io.to(roomId).emit('gameStarted', {
        message: 'La partie a commencé !',
      });

      // Envoyer immédiatement l'état du jeu
      const stateResult = BlackJackService.getGameState(roomId);
      if (stateResult.success && stateResult.state) {
        io.to(roomId).emit('updateGameState', { state: stateResult.state });
      }

      callback({ success: true });
    } catch (err: any) {
      callback({ success: false, error: err.message });
    }
  });

  // DEMANDE D'ÉTAT DU JEU
  socket.on('requestGameState', (data, callback) => {
    try {
      const { roomId } = data;
      if (!roomId) {
        callback({ success: false, error: 'roomId is required' });
        return;
      }
      const stateResult = BlackJackService.getGameState(roomId);
      if (stateResult.success && stateResult.state) {
        callback({ success: true, state: stateResult.state });
      } else {
        callback({ success: false, error: stateResult.error });
      }
    } catch (err: any) {
      callback({ success: false, error: err.message });
    }
  });

  // HIT
  socket.on('playerHit', (data, callback) => {
    const { roomId, playerId } = data;
    const result = BlackJackService.playerHit(roomId, playerId);
    if (!result.success) {
      callback({ success: false, error: result.error });
      return;
    }
    io.to(roomId).emit('updateGameState', { state: BlackJackService.getGameState(roomId).state });
    callback({ success: true });
  });

  // STAND
  socket.on('playerStand', (data, callback) => {
    const { roomId, playerId } = data;
    const result = BlackJackService.playerStand(roomId, playerId);
    if (!result.success) {
      callback({ success: false, error: result.error });
      return;
    }
    io.to(roomId).emit('updateGameState', { state: BlackJackService.getGameState(roomId).state });
    callback({ success: true });
  });


  // DISCONNECT
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // => Vous pouvez gérer la suppression du joueur dans la room si nécessaire.
  });
});

// Lancement du serveur
const PORT = Number(process.env.PORT) || 3001;
server.listen(PORT, '0.0.0.0', () => { // '0.0.0.0' permet d'écouter sur toutes les interfaces réseau
  console.log(`Server running on port ${PORT}`);
});
