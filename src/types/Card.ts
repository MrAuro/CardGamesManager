export type CardRank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "T"
  | "J"
  | "Q"
  | "K"
  | "A"
  | "-";
export type CardSuit = "h" | "d" | "c" | "s" | "-";

export type Card = `${CardRank}${CardSuit}`;
