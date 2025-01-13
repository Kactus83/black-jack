/**
 * Représente un slot à la table de Blackjack.
 * - playerId : identifiant du joueur occupant ce slot
 * - isOccupied : si le slot est occupé ou non (pour le mode 7 slots)
 * - bet, hasStood, isBusted, etc. seront ajoutés plus tard
 */
export class Seat {
    public playerId: string | null;
    public isOccupied: boolean;
  
    constructor() {
      this.playerId = null;
      this.isOccupied = false;
    }
  
    public occupy(playerId: string) {
      this.playerId = playerId;
      this.isOccupied = true;
    }
  
    public free() {
      this.playerId = null;
      this.isOccupied = false;
    }
  }