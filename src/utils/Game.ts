class GameManager {
  players: Player[] = [];

  addPlayer(player: Player) {
    console.log("Adding player", player);
    this.players.push(player);
  }

  removePlayer(playerId: string) {
    this.players = this.players.filter((player) => player.id !== playerId);
  }
}

type Card = {
  suit: CardSuit;
  rank: CardRank;
};

type CardSuit = "hearts" | "diamonds" | "clubs" | "spades" | "NONE";
type CardRank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K"
  | "A"
  | "NONE";

type Player = {
  id: string;
  name: string;
  cards: [Card, Card];
  balance: number;
};

export { GameManager };
export type { Card, CardSuit, CardRank, Player };
