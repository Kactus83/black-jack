import http from 'http';
import { ExpressApp } from './infrastructure/http/ExpressApp';
import { SocketServer } from './infrastructure/socket/SocketServer';

const PORT = process.env.PORT || 3001;

async function startServer() {
  // Initialisation de l’app Express (sans servir le front)
  const expressApp = new ExpressApp();
  const expressInstance = expressApp.getExpressInstance();

  // Création du serveur HTTP
  const httpServer = http.createServer(expressInstance);

  // Initialiser le serveur Socket.IO
  const socketServer = new SocketServer(httpServer);
  socketServer.start();

  // Écoute
  httpServer.listen(PORT, () => {
    console.log(`[index] Server running on port ${PORT}`);
  });
}

// Lancement
startServer().catch(err => {
  console.error('[index] Error starting server:', err);
});