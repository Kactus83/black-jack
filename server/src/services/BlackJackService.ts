import GameRoomManager from './GameRoomManager';
import { BlackJackGame } from '../models/BlackJackGame';
import { BlackJackPlayer } from '../models/BlackJackPlayer';

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
   */
  public static getGameState(roomId: string): { success: boolean; state?: any; error?: string } {
    const game = BlackJackService.games.get(roomId);
    if (!game) {
      return { success: false, error: 'No BlackJackGame for this room' };
    }
    const state = game.getStateForFront();
    return { success: true, state };
  }

  /**
   * Le joueur tire une carte supplémentaire.
   */
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
      return { success: false, error: 'No more cards in the deck' };
    }

    return { success: true };
  }

  /**
   * Le joueur décide de rester (Stand).
   */
  public static playerStand(roomId: string, playerId: string): { success: boolean; error?: string } {
    const game = BlackJackService.games.get(roomId);
    if (!game) {
      return { success: false, error: 'No BlackJackGame for this room' };
    }

    game.nextPlayer();
    return { success: true };
  }

  /**
   * Vérifie si la partie est terminée et détermine les gagnants.
   */
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
