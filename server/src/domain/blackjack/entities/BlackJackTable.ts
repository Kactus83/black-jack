import { Seat } from './Seat';

/**
 * BlackJackTable :
 * - Identifiant unique (tableId)
 * - Nombre max de slots (7)
 * - Croupier possible (isDealerPresent)
 * - seats[] : 7 emplacements
 */
export class BlackJackTable {
  public readonly tableId: string;
  public readonly seats: Seat[];
  public readonly isDealerPresent: boolean;  // Indique la présence d'un croupier
  // plus tard : deck, dealerHand, etc.

  constructor(tableId: string, isDealerPresent: boolean) {
    this.tableId = tableId;
    this.isDealerPresent = isDealerPresent;
    this.seats = [];
    for (let i = 0; i < 7; i++) {
      this.seats.push(new Seat());
    }
  }

  /**
   * Assigne un joueur à un seat disponible.
   * Retourne true si OK, false si pas de seat libre.
   */
  public assignPlayerToSeat(playerId: string): boolean {
    const freeSeat = this.seats.find((s) => !s.isOccupied);
    if (!freeSeat) return false;

    freeSeat.occupy(playerId);
    return true;
  }

  /**
   * Libère un seat occupé par un certain playerId
   */
  public unassignPlayer(playerId: string): void {
    const seat = this.seats.find((s) => s.playerId === playerId);
    if (seat) {
      seat.free();
    }
  }

  /**
   * Indique si tous les seats sont libres (ex: fin de partie)
   */
  public areAllSeatsEmpty(): boolean {
    return this.seats.every((s) => !s.isOccupied);
  }

  // D'autres méthodes viendront pour distribution, etc.
}