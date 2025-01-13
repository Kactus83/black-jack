import { v4 as uuidv4 } from 'uuid';
import { BlackJackTable } from '../entities/BlackJackTable';

/**
 * Service manipulant les tables de Blackjack.
 * Stockage en mémoire (Map<tableId, BlackJackTable>).
 * - createTable
 * - getTable
 * - assignPlayer
 * - ...
 */
export class BlackJackTableService {
  private static instance: BlackJackTableService;
  private tables: Map<string, BlackJackTable>;

  private constructor() {
    this.tables = new Map<string, BlackJackTable>();
  }

  public static getInstance(): BlackJackTableService {
    if (!BlackJackTableService.instance) {
      BlackJackTableService.instance = new BlackJackTableService();
    }
    return BlackJackTableService.instance;
  }

  /**
   * Crée une nouvelle table de Blackjack.
   * - isDealerPresent => mode standard (true) ou fun (false).
   */
  public createTable(isDealerPresent: boolean): BlackJackTable {
    const tableId = uuidv4().split('-')[0];
    const table = new BlackJackTable(tableId, isDealerPresent);

    this.tables.set(tableId, table);
    return table;
  }

  public getTable(tableId: string): BlackJackTable | undefined {
    return this.tables.get(tableId);
  }

  public removeTable(tableId: string): void {
    this.tables.delete(tableId);
  }

  /**
   * Assigne un joueur à un seat sur une table donnée.
   * Retourne {success, error?}
   */
  public assignPlayer(tableId: string, playerId: string): { success: boolean; error?: string } {
    const table = this.tables.get(tableId);
    if (!table) {
      return { success: false, error: 'Table not found' };
    }
    const ok = table.assignPlayerToSeat(playerId);
    if (!ok) {
      return { success: false, error: 'No free seat available' };
    }
    return { success: true };
  }
}