import io from 'socket.io-client';

/**
 * Récupère directement l'URL du serveur depuis les variables d'environnement.
 */
const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

console.log(`[Socket] URL du serveur WebSocket utilisée : ${SERVER_URL}`);

/**
 * Initialise et retourne une instance du socket.
 */
export const initializeSocket = async () => {
  console.log('[Socket] Initialisation du socket...');

  const socket = io(SERVER_URL, {
    autoConnect: false, // Connexion manuelle
  });

  // Écoute les principaux événements du socket
  socket.on('connect', () => {
    console.log(`[Socket] Connecté avec succès à : ${SERVER_URL}`);
  });

  socket.on('connect_error', (error: Error) => {
    console.error('[Socket] Erreur de connexion :', error.message || error);
  });

  socket.on('disconnect', () => {
    console.warn('[Socket] Déconnecté du serveur WebSocket.');
  });

  socket.on('reconnect_attempt', () => {
    console.log('[Socket] Tentative de reconnexion...');
  });

  return socket;
};

export default initializeSocket;
