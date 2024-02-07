import {
  IconHeartFilled,
  IconDiamondsFilled,
  IconClubsFilled,
  IconSpadeFilled,
} from "@tabler/icons-react";
import { ReactNode } from "react";

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
export const EMPTY_CARD: Card = "--";

export const isAnyEmpty = (card: Card): boolean => {
  return getSuit(card) === "-" || getRank(card) === "-";
};

export const suitToIcon = (suit: CardSuit): ReactNode => {
  let size = "1.7rem";

  switch (suit) {
    case "h":
      return <IconHeartFilled size={size} />;
    case "d":
      return <IconDiamondsFilled size={size} />;
    case "c":
      return <IconClubsFilled size={size} />;
    case "s":
      return <IconSpadeFilled size={size} />;
  }
};

export const getSuit = (card: Card): CardSuit => card[1] as CardSuit;
export const getRank = (card: Card): CardRank => card[0] as CardRank;

export const getRankInt = (card: Card): number => {
  const rank = getRank(card);
  if (rank === "T") return 10;
  if (rank === "J") return 10;
  if (rank === "Q") return 10;
  if (rank === "K") return 10;
  if (rank === "A") return 1;
  return parseInt(rank);
};
