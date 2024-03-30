import { Card } from "@/types/Card";

export const rankingToName = (rank: string): string => {
  switch (rank) {
    case "ROYAL_FLUSH":
      return "Royal Flush";
    case "STRAIGHT_FLUSH":
      return "Straight Flush";
    case "QUADS":
      return "Quads";
    case "FULL_HOUSE":
      return "Full House";
    case "FLUSH":
      return "Flush";
    case "STRAIGHT":
      return "Straight";
    case "THREE_OF_A_KIND":
      return "Three of a Kind";
    case "TWO_PAIRS":
      return "Two Pairs";
    case "ONE_PAIR":
      return "One Pair";
    case "HIGH_CARDS":
      return "High Cards";
    default:
      return "";
  }
};

// 2h7c to ["2h", "7c"]
export const joinedStringToCards = (cards: string | null): Card[] => {
  if (!cards) {
    return [];
  }

  let result: Card[] = [];
  for (let i = 0; i < cards.length; i += 2) {
    result.push(cards.slice(i, i + 2) as Card);
  }

  return result;
};

export const rankToNumber = (rank: string): number => {
  switch (rank) {
    case "2":
      return 2;
    case "3":
      return 3;
    case "4":
      return 4;
    case "5":
      return 5;
    case "6":
      return 6;
    case "7":
      return 7;
    case "8":
      return 8;
    case "9":
      return 9;
    case "T":
      return 10;
    case "J":
      return 11;
    case "Q":
      return 12;
    case "K":
      return 13;
    case "A":
      return 14;
    default:
      return 0;
  }
};
