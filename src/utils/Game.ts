import Hand from "pokersolver";

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

type PlayerPosition = "sb" | "bb" | "btn" | "NONE";

const suitToName = (suit: CardSuit) => {
  switch (suit) {
    case "hearts":
      return "Hearts";
    case "diamonds":
      return "Diamonds";
    case "clubs":
      return "Clubs";
    case "spades":
      return "Spades";
    default:
      return "";
  }
};

const rankToName = (rank: CardRank) => {
  switch (rank) {
    case "2":
      return "Two";
    case "3":
      return "Three";
    case "4":
      return "Four";
    case "5":
      return "Five";
    case "6":
      return "Six";
    case "7":
      return "Seven";
    case "8":
      return "Eight";
    case "9":
      return "Nine";
    case "10":
      return "Ten";
    case "J":
      return "Jack";
    case "Q":
      return "Queen";
    case "K":
      return "King";
    case "A":
      return "Ace";
    default:
      return "";
  }
};

const cardToString = (card: Card) => {
  if (card.rank == "NONE" || card.suit == "NONE") {
    return "NONE";
  }
  return `${card.rank}${card.suit[0]}`;
};

export { suitToName, rankToName, cardToString };
export type { Card, CardSuit, CardRank, Player, PlayerPosition };
