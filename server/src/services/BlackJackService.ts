import GameRoomManager from './GameRoomManager';
import { BlackJackGame } from '../models/BlackJackGame';

/**
 * Service gérant la logique du Blackjack au niveau des salles.
 * Il stocke pour chaque roomId une instance de BlackJackGame.
 */
class BlackJackService {

  // Map : roomId -> BlackJackGame
  private static games: Map<string, BlackJackGame> = new Map();

  /**
   * Lance la partie (création d'un nouveau BlackJackGame, distribution des cartes).
   */
  public static startGame(roomId: string): { success: boolean; error?: string } {
    const room = GameRoomManager.getInstance().getRoom(roomId);
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    const game = new BlackJackGame();
    game.initGame(room.players); 
    BlackJackService.games.set(roomId, game);

    return { success: true };
  }

  /**
   * Récupère l'état de la partie pour un roomId donné.
   * L'état inclut la main de chaque joueur (rank, suit) et le score calculé.
   */
  public static getGameState(roomId: string): { success: boolean; state?: any; error?: string } {
    const game = BlackJackService.games.get(roomId);
    if (!game) {
      return { success: false, error: 'No BlackJackGame for this room' };
    }
    const state = game.getStateForFront();
    return { success: true, state };
  }
}

export default BlackJackService;
