import { Server, Socket } from 'socket.io';
import { GameRoomService } from '../../domain/room/services/GameRoomService';
import { BlackJackTableService } from '../../domain/blackjack/services/BlackJackTableService';

/**
 * Contrôleur Socket pour la logique de démarrage du Blackjack.
 * - "startBlackJack" : crée une table, assigne les joueurs, etc.
 *
 * On pourra plus tard y ajouter "playerHit", "playerStand", etc.
 */
export class BlackJackSocketController {
  private io: Server;
  private gameRoomService: GameRoomService;
  private blackJackTableService: BlackJackTableService;

  constructor(io: Server) {
    this.io = io;
    this.gameRoomService = GameRoomService.getInstance();
    this.blackJackTableService = BlackJackTableService.getInstance();
  }

  public initialize(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`[BlackJackSocket] client connected: ${socket.id}`);

      // START BLACKJACK
      socket.on('startBlackJack', (data, callback) => {
        try {
          const { roomId, dealerMode } = data;
          /**
           * dealerMode : boolean (true => croupier présent, false => fun mode)
           * roomId : la Room qu'on veut démarrer en mode Blackjack
           */

          // 1. Récupérer la room
          const room = this.gameRoomService.getRoom(roomId);
          if (!room) {
            callback({ success: false, error: 'Room not found' });
            return;
          }

          // 2. Créer une table
          const table = this.blackJackTableService.createTable(dealerMode);

          // 3. Assigner chaque playerId de la room à un seat (automatique)
          const players = room.getPlayers();
          for (const p of players) {
            const assignResult = this.blackJackTableService.assignPlayer(table.tableId, p.id);
            if (!assignResult.success) {
              console.warn(`[BlackJackSocket] Impossible d'assigner le joueur ${p.id}: ${assignResult.error}`);
            }
          }

          // 4. Stocker le tableId quelque part ? 
          // => Soit dans la GameRoom pour retrouver la table plus tard
          // On peut étendre GameRoom en y ajoutant un champ "tableId"
          // (Ici on fait un hack rapide)
          (room as any).tableId = table.tableId;

          // 5. Notifier que la partie a démarré
          this.io.to(roomId).emit('blackJackStarted', {
            message: 'La partie BlackJack a démarré !',
            tableId: table.tableId,
          });

          callback({ success: true, tableId: table.tableId });
          console.log(`[BlackJackSocket] BlackJack started for room ${roomId}, tableId=${table.tableId}`);
        } catch (err: any) {
          callback({ success: false, error: err.message });
        }
      });

      // On pourra ajouter plus tard : 'playerAction', 'playerHit', etc.

      socket.on('disconnect', () => {
        console.log(`[BlackJackSocket] client disconnected: ${socket.id}`);
      });
    });
  }
}