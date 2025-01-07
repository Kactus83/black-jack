import { Deck } from './Deck';
import { Player } from './Player';
import { BlackJackPlayer } from './BlackJackPlayer';
import { Card } from './Card';

/**
 * Classe BlackJackGame, représentant une partie de Blackjack.
 * Elle contient un Deck, la liste des BlackJackPlayers,
 * et des méthodes pour initialiser et décrire l'état de la partie.
 */
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

    // Place la mise basique (exemple)
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
   * Exemple simple : mise fixe de 10, si un joueur n'a pas assez, il mise tout
   */
  private placeBets(): void {
    const betAmount = 10;
    for (const player of this.players) {
      if (player.chips >= betAmount) {
        player.bet = betAmount;
        player.chips -= betAmount;
      } else {
        player.bet = player.chips;
        player.chips = 0;
      }
    }
  }

  /**
   * Retourne la liste des joueurs (BlackJackPlayers).
   */
  public getPlayers(): BlackJackPlayer[] {
    return this.players;
  }

  /**
   * Méthode interne pour renvoyer l'état (exploitable par le front) de chaque joueur.
   */
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

      // Ajout pour afficher l'argent et la mise
      chips: bjPlayer.chips,
      bet: bjPlayer.bet,
    }));
  }

  /**
   * Le joueur tire une carte (Hit).
   */
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

  /**
   * Passe au joueur suivant (Stand).
   */
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
   * Distribue les gains aux joueurs qui ont <= 21, partage simple du pot
   */
  private distributeWinnings(): void {
    const winners = this.checkWinners();
    if (winners.length === 0) {
      return; // Personne ne gagne => pot perdu
    }
    const totalBet = this.players.reduce((acc, p) => acc + p.bet, 0);
    const share = Math.floor(totalBet / winners.length);
    for (const w of winners) {
      w.chips += share;
    }
  }

  public checkWinners() {
    return this.players.filter((p) => p.getScore() <= 21);
  }

  public isGameFinished(): boolean {
    return this.isGameOver;
  }
}
