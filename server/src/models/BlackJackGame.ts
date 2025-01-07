import { Deck } from './Deck';
import { Player } from './Player';
import { BlackJackPlayer } from './BlackJackPlayer';
import { Card } from './Card';

export class BlackJackGame {
  private deck: Deck;
  private players: BlackJackPlayer[];

  private currentPlayerIndex: number;
  private isGameOver: boolean;

  constructor() {
    this.deck = new Deck();
    this.players = [];
    this.currentPlayerIndex = 0;
    this.isGameOver = false;
  }

  /**
   * Initialise la partie en transformant chaque Player
   * en BlackJackPlayer, puis en leur distribuant 2 cartes.
   */
  public initGame(basePlayers: Player[]): void {
    this.players = [];

    for (const p of basePlayers) {
      const bjPlayer = new BlackJackPlayer(p.nickname);
      bjPlayer.id = p.id;
      this.players.push(bjPlayer);
    }

    this.deck.shuffle();

    // >>> AJOUT : placer la mise avant de distribuer
    this.placeBets();

    this.players.forEach((bjPlayer) => {
      bjPlayer.clearHand();
      const card1 = this.deck.drawCard();
      const card2 = this.deck.drawCard();
      if (card1) bjPlayer.addCard(card1);
      if (card2) bjPlayer.addCard(card2);
    });

    this.currentPlayerIndex = 0;
    this.isGameOver = false;

    this.checkBustAndAdvance();
  }

  /**
   * Place la mise basique pour tous les joueurs (par ex. 10).
   * Retire la mise de leur solde.
   */
  private placeBets(): void {
    const betAmount = 10;  // Montant fixe pour l'exemple
    for (const player of this.players) {
      if (player.chips >= betAmount) {
        player.bet = betAmount;
        player.chips -= betAmount;
      } else {
        // S'il n'a pas assez pour miser => mise = tout
        player.bet = player.chips;
        player.chips = 0;
      }
    }
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
      isBusted: bjPlayer.isBusted,
      hasStood: bjPlayer.hasStood,
      isCurrent: index === this.currentPlayerIndex,
      isGameOver: this.isGameOver,
      chips: bjPlayer.chips,
      bet: bjPlayer.bet,
    }));
  }

  public drawCardForPlayer(playerId: string): Card | null {
    if (this.isGameOver) return null;

    const currentPlayer = this.players[this.currentPlayerIndex];
    if (currentPlayer.id !== playerId) return null;
    if (currentPlayer.isBusted || currentPlayer.hasStood) return null;

    const card = this.deck.drawCard();
    if (card) {
      currentPlayer.addCard(card);
      const score = currentPlayer.getScore();
      if (score > 21) {
        currentPlayer.isBusted = true;
      }
    }

    this.checkBustAndAdvance();
    return card || null;
  }

  public nextPlayer(playerId: string): void {
    if (this.isGameOver) return;
    const currentPlayer = this.players[this.currentPlayerIndex];
    if (currentPlayer.id !== playerId) return;

    currentPlayer.hasStood = true;
    this.checkBustAndAdvance();
  }

  private checkBustAndAdvance(): void {
    while (true) {
      const current = this.players[this.currentPlayerIndex];
      if (current.isBusted || current.hasStood) {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      } else {
        break;
      }

      if (this.allPlayersDone()) {
        this.isGameOver = true;
        this.distributeWinnings(); 
        break;
      }
    }

    if (this.allPlayersDone()) {
      this.isGameOver = true;
      this.distributeWinnings();
    }
  }

  private allPlayersDone(): boolean {
    return this.players.every((p) => p.isBusted || p.hasStood);
  }

  /**
   * Distribue les gains aux joueurs qui ont <=21.
   * Exemple simple : on partage le pot entre les joueurs non bust,
   * ou si tous bust => croupier (pas implémenté), etc.
   */
  private distributeWinnings(): void {
    const winners = this.checkWinners();
    if (winners.length === 0) {
      // Personne ne gagne => pot perdu ?
      return;
    }

    // Somme totale des bets
    const totalBet = this.players.reduce((acc, p) => acc + p.bet, 0);
    // On partage de façon égale entre tous les winners
    const share = Math.floor(totalBet / winners.length);

    for (const w of winners) {
      w.chips += share;
    }
  }

  public checkWinners(): BlackJackPlayer[] {
    return this.players.filter((p) => p.getScore() <= 21);
  }

  public isGameFinished(): boolean {
    return this.isGameOver;
  }
}
