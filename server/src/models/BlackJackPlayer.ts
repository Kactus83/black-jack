import { Player } from './Player';
import { Card } from './Card';

/**
 * Classe BlackJackPlayer qui étend la classe Player,
 * pour éviter d'encombrer la classe générique Player
 * avec la logique propre au Blackjack.
 */
export class BlackJackPlayer extends Player {
  public hand: Card[] = [];

  // État de la partie
  public isBusted: boolean = false;
  public hasStood: boolean = false;

  // Système de mise
  public chips: number = 100; // capital
  public bet: number = 0;     // mise courante

  constructor(nickname: string) {
    super(nickname);
  }

  /**
   * Ajoute une carte dans la main du joueur.
   */
  public addCard(card: Card): void {
    this.hand.push(card);
  }

  /**
   * Réinitialise la main (lors d'une nouvelle partie, par ex.).
   */
  public clearHand(): void {
    this.hand = [];
    this.isBusted = false;
    this.hasStood = false;
    this.bet = 0; // On remet la mise à 0
  }

  /**
   * Calcule le score actuel du joueur en considérant les As comme 1 ou 11.
   * (Méthode simple à améliorer pour gérer les split, double, etc.)
   */
  public getScore(): number {
    let score = 0;
    let aceCount = 0;

    for (const card of this.hand) {
      switch (card.rank) {
        case 'A':
          score += 11;
          aceCount++;
          break;
        case 'K':
        case 'Q':
        case 'J':
        case '10':
          score += 10;
          break;
        default:
          score += parseInt(card.rank, 10);
          break;
      }
    }

    // Ajuster la valeur des As si le score dépasse 21
    while (score > 21 && aceCount > 0) {
      score -= 10;
      aceCount--;
    }

    return score;
  }
}
