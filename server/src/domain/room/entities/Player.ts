import { v4 as uuidv4 } from 'uuid';

/**
 * Entité Player : un id + un pseudo
 */
export class Player {
  public readonly id: string;
  public nickname: string;

  constructor(nickname: string) {
    this.id = uuidv4();
    this.nickname = nickname;
  }
}