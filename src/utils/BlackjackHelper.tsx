import { Card, getRank, isAnyEmpty } from "./CardHelper";
import { Player } from "../types/Player";

export type BlackjackGameState = "NONE" | "PLAYING" | "GAME_OVER";

export type BlackjackPlayer = {
  displayName?: string;
  id: string; // Player id (except when split, where its a new id)
  cards: Card[];
  bet: number;
  doubledDown: boolean;
  split: boolean;
  splitFrom?: string; // For split hands, the id of the original hand
  handPartialResult?: "BUST" | "BLACKJACK";
  handResult?: "WIN" | "LOSE" | "PUSH";
  sidebets: {
    // 0/null means no bet
    twentyOnePlusThree: number | null;
    perfectPairs: number | null;
    betBehind: {
      bet: number | null;
      target: string | null; // Target player id
    };
  };
};

export const getPlayer = (idOrPlayer: string | BlackjackPlayer, players: Player[]): Player => {
  let id: string = typeof idOrPlayer === "string" ? idOrPlayer : idOrPlayer.id;

  let player = players.find((player: Player) => player.id === id);
  if (player == null) {
    throw new Error(`Player with id ${id} not found`);
  }

  return player;
};

type GetCardTotalResponse = {
  ace: "SOFT" | "HARD" | "NONE";
  total: number;
};

export const getCardTotal = (cards: Card[]): GetCardTotalResponse => {
  let total = 0;
  let aceCount = 0;
  for (let card of cards) {
    if (isAnyEmpty(card)) continue;
    if (getRank(card) === "A") {
      aceCount++;
      total += 11;
    } else if (
      getRank(card) === "T" ||
      getRank(card) === "J" ||
      getRank(card) === "Q" ||
      getRank(card) === "K"
    ) {
      total += 10;
    } else {
      total += parseInt(getRank(card));
    }
  }

  let softAceCount = aceCount;
  while (total > 21 && aceCount > 0) {
    total -= 10;
    aceCount--;
    softAceCount--;
  }

  let aceHard = softAceCount > 0;

  aceHard = !aceHard;

  return {
    ace: aceHard
      ? cards.some((c) => getRank(c) === "A")
        ? "HARD"
        : "NONE"
      : softAceCount > 0
      ? "SOFT"
      : "NONE",
    total: total,
  };
};

// https://github.com/gsdriver/blackjack-strategy
