import { Player } from './Player';

export class GameRoom {
  public roomId: string;
  public players: Player[];

  constructor(roomId: string) {
    this.roomId = roomId;
    this.players = [];
  }

  public addPlayer(player: Player): void {
    this.players.push(player);
  }
}
