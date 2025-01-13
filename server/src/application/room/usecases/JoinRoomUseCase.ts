import { GameRoomService } from '../../../domain/room/services/GameRoomService';

/**
 * UseCase : Rejoindre une room existante
 */
export class JoinRoomUseCase {
  private gameRoomService: GameRoomService;

  constructor() {
    this.gameRoomService = GameRoomService.getInstance();
  }

  public execute(roomId: string, nickname: string): {
    success: boolean;
    playerId?: string;
    error?: string;
  } {
    if (!roomId || !nickname || !nickname.trim()) {
      return { success: false, error: 'roomId and nickname are required' };
    }

    const result = this.gameRoomService.joinRoom(roomId, nickname);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      playerId: result.player?.id
    };
  }
}