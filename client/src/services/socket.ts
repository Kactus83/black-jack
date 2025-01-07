import io, { type Socket as SocketClient } from 'socket.io-client';

const SERVER_URL_LIST = process.env.REACT_APP_SERVER_URL_LIST || '';

console.log('[Socket] Liste des URLs du serveur WebSocket détectées :', SERVER_URL_LIST);

let socket: typeof SocketClient | null = null;

/**
 * Initialise et retourne une instance unique du socket.
 */
export const initializeSocket = async (): Promise<typeof SocketClient> => {
  if (socket) {
    console.log('[Socket] Instance existante réutilisée.');
    return socket;
  }

  console.log('[Socket] Initialisation du socket...');

  const serverUrls = SERVER_URL_LIST
    .split(',')
    .map(url => url.trim())
    .filter(url => url !== '');

  if (serverUrls.length === 0) {
    console.error('[Socket] Aucune URL du serveur WebSocket n\'a été fournie.');
    throw new Error('Aucune URL fournie. Vérifiez le script de démarrage.');
  }

  // On essaie chaque URL
  for (const url of serverUrls) {
    console.log(`[Socket] Tentative de connexion à : ${url}`);
    const candidate = io(url, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      timeout: 5000,
    });

    try {
      await new Promise<void>((resolve, reject) => {
        candidate.once('connect', () => {
          console.log(`[Socket] Connecté avec succès à : ${url}`);
          resolve();
        });

        candidate.once('connect_error', (error: Error) => {
          console.warn(`[Socket] Connexion échouée à : ${url} -`, error.message);
          reject(error);
        });

        candidate.connect();
      });

      // On adopte ce socket si connexion réussie
      socket = candidate;

      socket.on('disconnect', () => {
        console.warn('[Socket] Déconnecté du serveur WebSocket.');
      });

      socket.on('reconnect_attempt', () => {
        console.log('[Socket] Tentative de reconnexion...');
      });

      return socket;
    } catch (e) {
      // Échec => on ferme le candidate et on essaie l’adresse suivante
      candidate.close();
      console.warn(`[Socket] Échec de connexion pour ${url}, on tente la suivante...`);
    }
  }

  // Aucune URL n’a fonctionné
  throw new Error('[Socket] Impossible de se connecter à aucune adresse WebSocket.');
};

export default initializeSocket;
