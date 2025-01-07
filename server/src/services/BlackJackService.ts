import GameRoomManager from './GameRoomManager';
import { BlackJackGame } from '../models/BlackJackGame';
import { BlackJackPlayer } from '../models/BlackJackPlayer';

/**
 * Service gérant la logique du Blackjack au niveau des salles.
 */
class BlackJackService {
  private static games: Map<string, BlackJackGame> = new Map();

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

  public static getGameState(roomId: string): { success: boolean; state?: any; error?: string } {
    const game = BlackJackService.games.get(roomId);
    if (!game) {
      return { success: false, error: 'No BlackJackGame for this room' };
    }
    const state = game.getStateForFront();
    return { success: true, state };
  }

  public static playerHit(roomId: string, playerId: string): { success: boolean; error?: string } {
    const game = BlackJackService.games.get(roomId);
    if (!game) {
      return { success: false, error: 'No BlackJackGame for this room' };
    }

    const player = game.getPlayers().find((p) => p.id === playerId);
    if (!player) {
      return { success: false, error: 'Player not found in this game' };
    }

    const card = game.drawCardForPlayer(playerId);
    if (!card) {
      // => Soit plus de cartes, soit c'est pas son tour, ou isGameOver
      return { success: false, error: 'Cannot draw card at this moment' };
    }

    return { success: true };
  }

  public static playerStand(roomId: string, playerId: string): { success: boolean; error?: string } {
    const game = BlackJackService.games.get(roomId);
    if (!game) {
      return { success: false, error: 'No BlackJackGame for this room' };
    }

    // Passer au joueur suivant
    game.nextPlayer(playerId);
    return { success: true };
  }

  public static checkGameEnd(roomId: string): { success: boolean; winners?: BlackJackPlayer[] } {
    const game = BlackJackService.games.get(roomId);
    if (!game) {
      return { success: false };
    }
    const winners = game.checkWinners();
    return { success: true, winners };
  }
}

export default BlackJackService;
