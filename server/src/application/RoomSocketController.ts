import { Server, Socket } from 'socket.io';
import { CreateRoomUseCase } from './room/usecases/CreateRoomUseCase';
import { JoinRoomUseCase } from './room/usecases/JoinRoomUseCase';
import { GameRoomService } from '../domain/room/services/GameRoomService';

export class RoomSocketController {
  private io: Server;
  private createRoomUC: CreateRoomUseCase;
  private joinRoomUC: JoinRoomUseCase;

  constructor(io: Server) {
    this.io = io;
    this.createRoomUC = new CreateRoomUseCase();
    this.joinRoomUC = new JoinRoomUseCase();
  }

  public initialize(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`[RoomSocket] New client connected: ${socket.id}`);

      // CREATE ROOM
      socket.on('createRoom', (data, callback) => {
        try {
          const { nickname } = data;
          const result = this.createRoomUC.execute(nickname);
          if (!result.success) {
            callback({ success: false, error: result.error });
            return;
          }
          // Rejoindre la room Socket.IO
          const roomId = result.roomId!;
          socket.join(roomId);

          callback({
            success: true,
            roomId,
            playerId: result.playerId
          });

          console.log(`[RoomSocket] Room created: ${roomId}`);

          // NOUVEAU : Émettre l'état de la room => "roomUpdated"
          this.emitRoomUpdated(roomId);
        } catch (err: any) {
          callback({ success: false, error: err.message });
        }
      });

      // JOIN ROOM
      socket.on('joinRoom', (data, callback) => {
        try {
          const { roomId, nickname } = data;
          const result = this.joinRoomUC.execute(roomId, nickname);
          if (!result.success) {
            callback({ success: false, error: result.error });
            return;
          }
          socket.join(roomId);

          callback({
            success: true,
            playerId: result.playerId
          });
          console.log(`[RoomSocket] Player joined room: ${roomId}`);

          // NOUVEAU : Émettre l'état de la room => "roomUpdated"
          this.emitRoomUpdated(roomId);
        } catch (err: any) {
          callback({ success: false, error: err.message });
        }
      });

      // LIST ROOMS
      socket.on('fetchRooms', (callback) => {
        try {
          const roomsData = GameRoomService.getInstance().listRooms();
          callback({ success: true, rooms: roomsData });
        } catch (err: any) {
          callback({ success: false, error: err.message });
        }
      });

      socket.on('disconnect', () => {
        console.log(`[RoomSocket] Client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Méthode privée : Émet "roomUpdated" à tous les sockets de la room.
   * On y envoie la liste complète des joueurs, afin que le front puisse rafraîchir.
   */
  private emitRoomUpdated(roomId: string) {
    const room = GameRoomService.getInstance().getRoom(roomId);
    if (!room) return;

    const players = room.getPlayers();

    this.io.to(roomId).emit('roomUpdated', {
      players,
    });
  }
}
