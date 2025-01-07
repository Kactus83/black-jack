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

  // >>> AJOUTS POUR GERER LE CYCLE
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

    // On commence au joueur 0
    this.currentPlayerIndex = 0;
    this.isGameOver = false;

    // Vérifier si quelqu'un a déjà >21
    this.checkBustAndAdvance();
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
    // Tableau d'objets typés:
    //  - id
    //  - nickname
    //  - hand: tableau de { rank, suit }
    //  - score
    //  - isBusted, hasStood
    //  - isCurrent: si c'est le joueur dont c'est le tour
    //  - isGameOver: si la partie est terminée
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
    }));
  }

  /**
   * Le joueur tire une carte (Hit).
   */
  public drawCardForPlayer(playerId: string): Card | null {
    // Si la partie est déjà terminée, on n'autorise plus rien
    if (this.isGameOver) return null;

    // Vérifier si c'est bien le joueur en cours
    const currentPlayer = this.players[this.currentPlayerIndex];
    if (currentPlayer.id !== playerId) return null;

    // Si joueur bust ou stand déjà => rien
    if (currentPlayer.isBusted || currentPlayer.hasStood) return null;

    const card = this.deck.drawCard();
    if (card) {
      currentPlayer.addCard(card);
      // Vérif si bust
      const score = currentPlayer.getScore();
      if (score > 21) {
        currentPlayer.isBusted = true;
      }
    }

    // Vérifier si la partie doit se terminer
    this.checkBustAndAdvance();

    return card || null;
  }

  /**
   * Passe au joueur suivant (Stand).
   */
  public nextPlayer(playerId: string): void {
    // Si la partie est déjà terminée
    if (this.isGameOver) return;

    const currentPlayer = this.players[this.currentPlayerIndex];
    if (currentPlayer.id !== playerId) {
      // Ce n'est pas le tour de ce joueur
      return;
    }

    // Marquer le joueur comme ayant fait Stand
    currentPlayer.hasStood = true;

    // Avancer
    this.checkBustAndAdvance();
  }

  /**
   * Vérifier si le joueur en cours est bust ou stand, puis passer au suivant si besoin.
   * Vérifie ensuite si la partie est terminée (tous bust ou stand).
   */
  private checkBustAndAdvance(): void {
    // Boucle tant que le joueur courant est bust ou stand => on passe au suivant
    while (true) {
      const current = this.players[this.currentPlayerIndex];
      if (current.isBusted || current.hasStood) {
        // On passe au suivant
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      } else {
        // Le joueur courant peut jouer, on s’arrête
        break;
      }

      // Si tous bust ou stand => on vérifie la fin
      if (this.allPlayersDone()) {
        this.isGameOver = true;
        break;
      }
    }

    // Enfin, si la partie est terminée car tous ont bust ou stand
    if (this.allPlayersDone()) {
      this.isGameOver = true;
    }
  }

  /**
   * Vérifie si tous les joueurs sont bust ou ont fait stand.
   */
  private allPlayersDone(): boolean {
    // true si chaque joueur est isBusted ou hasStood
    return this.players.every(
      (p) => p.isBusted || p.hasStood,
    );
  }

  /**
   * Détermine les gagnants de la partie (ceux qui ont <= 21).
   */
  public checkWinners(): BlackJackPlayer[] {
    return this.players.filter((p) => p.getScore() <= 21);
  }
}
