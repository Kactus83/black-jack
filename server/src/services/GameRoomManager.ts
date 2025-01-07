import { v4 as uuidv4 } from 'uuid';
import { GameRoom } from '../models/GameRoom';
import { Player } from '../models/Player';

class GameRoomManager {
  private static instance: GameRoomManager;
  private rooms: Map<string, GameRoom>;

  private constructor() {
    this.rooms = new Map<string, GameRoom>();
  }

  public static getInstance(): GameRoomManager {
    if (!GameRoomManager.instance) {
      GameRoomManager.instance = new GameRoomManager();
    }
    return GameRoomManager.instance;
  }

  public createRoom(nickname: string): { roomId: string; player: Player } {
    // on génère un petit ID pour la room, par exemple un bout de UUID
    const roomId = uuidv4().split('-')[0];

    const player = new Player(nickname);

    const newRoom = new GameRoom(roomId);
    newRoom.addPlayer(player);

    this.rooms.set(roomId, newRoom);

    return { roomId, player };
  }

  public joinRoom(roomId: string, nickname: string): {
    success: boolean;
    player?: Player;
    error?: string;
  } {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    const player = new Player(nickname);
    room.addPlayer(player);

    return { success: true, player };
  }

  public getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId);
  }
}

export default GameRoomManager;
