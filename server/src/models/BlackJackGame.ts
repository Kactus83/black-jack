import { Deck } from './Deck';
import { Player } from './Player';
import { BlackJackPlayer } from './BlackJackPlayer';

/**
 * Classe BlackJackGame, représentant une partie de Blackjack.
 * Elle contient un Deck, la liste des BlackJackPlayers,
 * et des méthodes pour initialiser et décrire l'état de la partie.
 */
export class BlackJackGame {
  private deck: Deck;
  private players: BlackJackPlayer[];

  constructor() {
    this.deck = new Deck();
    this.players = [];
  }

  /**
   * Initialise la partie en transformant chaque Player 
   * en BlackJackPlayer, puis en leur distribuant 2 cartes.
   */
  public initGame(basePlayers: Player[]): void {

    // On vide la liste existante (si une partie précédente existait)
    this.players = [];

    // Transformer chaque Player en BlackJackPlayer
    for (const p of basePlayers) {
      const bjPlayer = new BlackJackPlayer(p.nickname);
      bjPlayer.id = p.id; 
      this.players.push(bjPlayer);
    }

    // Mélanger le deck et distribuer 2 cartes à chaque joueur
    this.deck.shuffle();

    this.players.forEach((bjPlayer) => {
      bjPlayer.clearHand();
      const card1 = this.deck.drawCard();
      const card2 = this.deck.drawCard();
      if (card1) bjPlayer.addCard(card1);
      if (card2) bjPlayer.addCard(card2);
    });
  }

  /**
   * Retourne un tableau de joueurs (BlackJackPlayers).
   */
  public getPlayers(): BlackJackPlayer[] {
    return this.players;
  }

  /**
   * Méthode interne pour renvoyer l'état
   * (exploitable par le front) de chaque joueur.
   */
  public getStateForFront() {
    // Tableau d'objets typés:
    //  - id
    //  - nickname
    //  - hand: tableau de { rank, suit }
    //  - score
    return this.players.map((bjPlayer) => ({
      id: bjPlayer.id,
      nickname: bjPlayer.nickname,
      hand: bjPlayer.hand.map((card) => ({
        rank: card.rank,
        suit: card.suit,
      })),
      score: bjPlayer.getScore(),
    }));
  }
}
