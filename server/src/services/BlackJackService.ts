import { Server } from 'socket.io';
import GameRoomManager from './GameRoomManager';
import { BlackJackGame } from '../models/BlackJackGame';
import { BlackJackPlayer } from '../models/BlackJackPlayer';

/**
 * Service gérant la logique du Blackjack au niveau des salles.
 */
class BlackJackService {
  private static games: Map<string, BlackJackGame> = new Map();

  // Ajout pour émettre des events depuis le service
  private static io: Server | null = null;

  /**
   * Initialise le service avec la référence Socket.IO
   */
  public static init(ioInstance: Server) {
    BlackJackService.io = ioInstance;
  }

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

    const card = game.drawCardForPlayer(playerId);
    if (!card) {
      // => Soit plus de cartes, soit c'est pas son tour, ou isGameOver
      return { success: false, error: 'Cannot draw card at this moment' };
    }

    // Si la partie est finie => schedule new game
    if (game.isGameFinished()) {
      BlackJackService.scheduleNewGameIn5Sec(roomId);
    }

    return { success: true };
  }

  public static playerStand(roomId: string, playerId: string): { success: boolean; error?: string } {
    const game = BlackJackService.games.get(roomId);
    if (!game) {
      return { success: false, error: 'No BlackJackGame for this room' };
    }

    game.nextPlayer(playerId);

    // Si la partie est finie => schedule new game
    if (game.isGameFinished()) {
      BlackJackService.scheduleNewGameIn5Sec(roomId);
    }

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

  /**
   * Programmera une nouvelle partie dans 5 secondes,
   * en réinitialisant tout via startGame(roomId).
   */
  private static scheduleNewGameIn5Sec(roomId: string) {
    console.log(`[BlackJackService] La partie est terminée. Nouvelle partie dans 5 secondes...`);
    setTimeout(() => {
      const room = GameRoomManager.getInstance().getRoom(roomId);
      if (!room) {
        console.warn(`Impossible de relancer la partie pour la room: ${roomId} (room introuvable).`);
        return;
      }
      console.log(`[BlackJackService] Relance de la partie pour la room: ${roomId}`);
      BlackJackService.startGame(roomId);

      // Après avoir relancé, on diffuse l'état
      const stateResult = BlackJackService.getGameState(roomId);
      if (stateResult.success && stateResult.state && BlackJackService.io) {
        BlackJackService.io.to(roomId).emit('updateGameState', { state: stateResult.state });
      }
    }, 5000);
  }
}

export default BlackJackService;
