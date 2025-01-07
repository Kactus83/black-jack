import { v4 as uuidv4 } from 'uuid';

export class Player {
  public id: string;
  public nickname: string;

  constructor(nickname: string) {
    this.id = uuidv4();
    this.nickname = nickname;
  }
}
