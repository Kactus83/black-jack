import { Card, Suit, Rank } from './Card';

export class Deck {
  private cards: Card[];

  constructor() {
    this.cards = this.generateDeck();
  }

  private generateDeck(): Card[] {
    const suits = [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES];
    const ranks = [
      Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX,
      Rank.SEVEN, Rank.EIGHT, Rank.NINE, Rank.TEN,
      Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE
    ];

    const newDeck: Card[] = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        newDeck.push(new Card(rank, suit));
      }
    }
    return newDeck;
  }

  public shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  public drawCard(): Card | undefined {
    return this.cards.pop();
  }

  public getRemainingCards(): number {
    return this.cards.length;
  }
}
