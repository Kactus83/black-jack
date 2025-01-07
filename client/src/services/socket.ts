import io from 'socket.io-client';

// Pointer vers le serveur Node/Express
const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

const socket = io(SERVER_URL, {
  autoConnect: false, // Gerer la connexion manuellement
});

export default socket;
