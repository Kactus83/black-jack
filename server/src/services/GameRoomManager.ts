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

  /**
   * Cette méthode permet de rejoindre une room existante.
   * @param roomId ID de la room à rejoindre
   * @param nickname Pseudo du joueur
   */
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

  /**
   * Cette méthode permet de récupérer une room par son ID.
   * @param roomId 
   * @returns Une instance de GameRoom ou undefined si non trouvée.
   */
  public getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId);
  }


  /**
   * Retourne la liste de toutes les rooms actives (IDs).
   */
  public getAllRooms(): string[] {
    return [...this.rooms.keys()];
  }

  /**
   * Retourne la liste détaillée de toutes les rooms,
   * incluant le nombre de joueurs et la liste de pseudos.
   */
  public getAllRoomsDetailed(): Array<{
    roomId: string;
    playersCount: number;
    players: { id: string; nickname: string }[];
  }> {
    const roomsArray: Array<{
      roomId: string;
      playersCount: number;
      players: { id: string; nickname: string }[];
    }> = [];

    for (const roomId of this.rooms.keys()) {
      const room = this.rooms.get(roomId);
      if (room) {
        roomsArray.push({
          roomId,
          playersCount: room.players.length,
          players: room.players.map((p) => ({
            id: p.id,
            nickname: p.nickname,
          })),
        });
      }
    }
    return roomsArray;
  }
}

export default GameRoomManager;
