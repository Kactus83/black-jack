import { GameRoomService } from '../../../domain/room/services/GameRoomService';

/**
 * UseCase : Création d'une room avec un premier joueur (host).
 */
export class CreateRoomUseCase {
  private gameRoomService: GameRoomService;

  constructor() {
    this.gameRoomService = GameRoomService.getInstance();
  }

  public execute(nickname: string): {
    success: boolean;
    roomId?: string;
    playerId?: string;
    error?: string;
  } {
    if (!nickname || !nickname.trim()) {
      return { success: false, error: 'Nickname is required' };
    }

    const { roomId, player } = this.gameRoomService.createRoom(nickname);

    return {
      success: true,
      roomId,
      playerId: player.id
    };
  }
}