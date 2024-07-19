import {
  IconHeartFilled,
  IconDiamondsFilled,
  IconClubsFilled,
  IconSpadeFilled,
} from "@tabler/icons-react";
import { ReactNode } from "react";
import { Card, CardRank, CardSuit } from "../types/Card";

export const isAnyEmpty = (card: Card): boolean => {
  return getSuit(card) === "-" || getRank(card) === "-";
};

export const isCardEmpty = (card: Card): boolean => card === EMPTY_CARD;

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
    case "-":
      return null;
  }
};

export const getSuit = (card: Card): CardSuit => card[1] as CardSuit;
export const getRank = (card: Card): CardRank => card[0] as CardRank;

export const EMPTY_CARD: Card = "--";

export const getRankInt = (card: Card): number => {
  const rank = getRank(card);
  if (rank === "T") return 10;
  if (rank === "J") return 10;
  if (rank === "Q") return 10;
  if (rank === "K") return 10;
  if (rank === "A") return 1;
  return parseInt(rank);
};

export const getRandomCard = (usedCards: Card[] = []): Card => {
  const suits: CardSuit[] = ["h", "d", "c", "s"];
  const ranks: CardRank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
  const availableCards: Card[] = [];

  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      const card: Card = `${rank}${suit}`;
      if (!usedCards.includes(card)) {
        availableCards.push(card);
      }
    });
  });

  if (availableCards.length === 0) {
    throw new Error("No more cards available");
  }

  const randomIndex = Math.floor(Math.random() * availableCards.length);
  return availableCards[randomIndex];
};
