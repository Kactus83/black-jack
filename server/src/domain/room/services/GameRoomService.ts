import { v4 as uuidv4 } from 'uuid';
import { GameRoom } from '../entities/GameRoom';
import { Player } from '../entities/Player';

/**
 * Service manipulant les GameRoom.
 * Étape 1 : 
 * - Créer une room
 * - Rejoindre une room
 * - Lister les rooms
 */
export class GameRoomService {
  private static instance: GameRoomService;
  private rooms: Map<string, GameRoom>;

  private constructor() {
    this.rooms = new Map<string, GameRoom>();
  }

  public static getInstance(): GameRoomService {
    if (!GameRoomService.instance) {
      GameRoomService.instance = new GameRoomService();
    }
    return GameRoomService.instance;
  }

  /**
   * Crée une nouvelle room, et y ajoute un premier joueur (host)
   */
  public createRoom(nickname: string): { roomId: string; player: Player } {
    // Générer un id de room
    const roomId = uuidv4().split('-')[0]; // Par exemple, on raccourcit le uuid
    const newRoom = new GameRoom(roomId);

    // Créer le player (host)
    const player = new Player(nickname);
    newRoom.addPlayer(player);

    // Stocker la room
    this.rooms.set(roomId, newRoom);

    return { roomId, player };
  }

  /**
   * Rejoint une room existante
   */
  public joinRoom(roomId: string, nickname: string): { success: boolean; player?: Player; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    const newPlayer = new Player(nickname);
    room.addPlayer(newPlayer);

    return { success: true, player: newPlayer };
  }

  /**
   * Récupérer une room
   */
  public getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Lister toutes les rooms
   */
  public listRooms(): Array<{ roomId: string; playersCount: number }> {
    const arr: Array<{ roomId: string; playersCount: number }> = [];
    for (const [key, room] of this.rooms) {
      arr.push({
        roomId: key,
        playersCount: room.getPlayers().length
      });
    }
    return arr;
  }
}
