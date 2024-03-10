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
export type CardSuit = "h" | "s" | "d" | "c" | "-";

export type CardRank_NOEMPTY =
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
  | "A";
export type CardSuit_NOEMPTY = "h" | "s" | "d" | "c";

export type Card = `${CardRank}${CardSuit}`;
