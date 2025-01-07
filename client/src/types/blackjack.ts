/**
 * Les couleurs possibles.
 * (Chaînes de caractère pour la compatibilité JSON)
 */
export enum Suit {
    HEARTS = 'HEARTS',
    DIAMONDS = 'DIAMONDS',
    CLUBS = 'CLUBS',
    SPADES = 'SPADES',
  }
  
  /**
   * Les rangs possibles.
   */
  export enum Rank {
    TWO = '2',
    THREE = '3',
    FOUR = '4',
    FIVE = '5',
    SIX = '6',
    SEVEN = '7',
    EIGHT = '8',
    NINE = '9',
    TEN = '10',
    JACK = 'J',
    QUEEN = 'Q',
    KING = 'K',
    ACE = 'A',
  }
  
  /**
   * Représente une carte en front-end.
   * Note : Le serveur envoie rank/suit sous forme de string (ex.: "A", "SPADES")
   * vérifier si nécessaire de faire un cast côté client.
   */
  export interface Card {
    rank: Rank; 
    suit: Suit; 
  }
  
/**
 * État d'un joueur dans une partie de Blackjack.
 * Contient les informations détaillées utilisées après le début du jeu.
 */
export interface BlackJackPlayerState {
  id: string;             // Identifiant unique du joueur
  nickname: string;       // Pseudo du joueur
  hand: Card[];           // La main (liste de cartes)
  score: number;          // Score actuel du joueur calculé côté serveur
  isCurrent: boolean;     // Indique si c'est au tour de ce joueur
  isBusted: boolean;      // Indique si le joueur a dépassé 21
  hasStood: boolean;      // Indique si le joueur a décidé de rester (stand)
  isGameOver: boolean;    // Indique si la partie est terminée pour ce joueur
}

  
  /**
   * Payload de l'événement "gameStarted"
   */
  export interface GameStartedPayload {
    message: string;
  }
  
  /**
   * Payload de l'événement "updateGameState"
   */
  export interface UpdateGameStatePayload {
    state: BlackJackPlayerState[];
  }
  