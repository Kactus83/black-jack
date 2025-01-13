import { Server } from 'socket.io';
import http from 'http';
import { RoomSocketController } from '../../application/RoomSocketController';
import { BlackJackSocketController } from '../../application/blackjack/BlackJackSocketController';

export class SocketServer {
  private io: Server;

  constructor(server: http.Server) {
    this.io = new Server(server, {
      cors: { origin: '*' },
    });
  }

  public start(): void {
    console.log('[SocketServer] Starting Socket.IO...');

    // Contrôleur pour la gestion des rooms
    const roomCtrl = new RoomSocketController(this.io);
    roomCtrl.initialize();

    // Contrôleur pour la logique Blackjack
    const bjCtrl = new BlackJackSocketController(this.io);
    bjCtrl.initialize();
  }

  public getIO(): Server {
    return this.io;
  }
}