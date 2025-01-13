import { Player } from './Player';

/**
 * Entité GameRoom
 * - roomId
 * - liste de joueurs
 * À l'étape 1, on ne gère que ça
 */
export class GameRoom {
  public readonly roomId: string;
  private players: Player[];
  public tableId: string | null;

  constructor(roomId: string) {
    this.roomId = roomId;
    this.players = [];
    this.tableId = null;
  }

  public addPlayer(player: Player): void {
    this.players.push(player);
  }

  public getPlayers(): Player[] {
    return this.players;
  }
}