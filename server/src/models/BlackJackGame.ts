import { Deck } from './Deck';
import { Player } from './Player';
import { BlackJackPlayer } from './BlackJackPlayer';
import { Card } from './Card';

export class BlackJackGame {
  private deck: Deck;
  private players: BlackJackPlayer[];
  private currentPlayerIndex: number; 
  constructor() {
    this.deck = new Deck();
    this.players = [];
    this.currentPlayerIndex = 0;
  }

  public initGame(basePlayers: Player[]): void {
    this.players = [];

    for (const p of basePlayers) {
      const bjPlayer = new BlackJackPlayer(p.nickname);
      bjPlayer.id = p.id;
      this.players.push(bjPlayer);
    }

    this.deck.shuffle();

    this.players.forEach((bjPlayer) => {
      bjPlayer.clearHand();
      const card1 = this.deck.drawCard();
      const card2 = this.deck.drawCard();
      if (card1) bjPlayer.addCard(card1);
      if (card2) bjPlayer.addCard(card2);
    });

    // On commence au joueur 0
    this.currentPlayerIndex = 0;
  }

  public getPlayers(): BlackJackPlayer[] {
    return this.players;
  }

  public getStateForFront() {
    return this.players.map((bjPlayer, index) => ({
      id: bjPlayer.id,
      nickname: bjPlayer.nickname,
      hand: bjPlayer.hand.map((card) => ({
        rank: card.rank,
        suit: card.suit,
      })),
      score: bjPlayer.getScore(),
      isCurrent: index === this.currentPlayerIndex, // indique si c'est le joueur en cours
    }));
  }

  /**
   * Le joueur tire une carte.
   */
  public drawCardForPlayer(playerId: string): Card | null {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return null;

    const card = this.deck.drawCard();
    if (card) {
      player.addCard(card);
    }
    return card || null;
  }

  /**
   * Passe au joueur suivant (lors du Stand).
   */
  public nextPlayer(): void {
    if (this.players.length < 2) {
      // Si un seul joueur, nextPlayer n'a pas trop de sens
      return;
    }
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
  }

  public checkWinners(): BlackJackPlayer[] {
    return this.players.filter((p) => p.getScore() <= 21);
  }
}
