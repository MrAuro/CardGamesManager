import { BlackjackSettings } from "@/types/Blackjack";
import { Card, CardRank } from "@/types/Card";
import { getRank } from "./CardHelper";

export function getPlayerErrors(
  balance: number,
  settings: BlackjackSettings,
  bets: {
    bet: number;
    twentyOnePlusThree: number;
    perfectPairs: number;
    betBehindBet: number;
    betBehindTarget: string | null;
  }
): string[] {
  // Rather than passing the the player and blackjackPlayer objects,
  // we pass in the balance and a flattened bets object
  // This is done to prevent the state from being one behind
  // (due to the new bet being saved after the errors are calculated)

  const errors: string[] = [];

  let totalBet = 0;
  if (bets.bet < 0) errors.push("Invalid bet amount");
  totalBet += bets.bet;

  if (settings.twentyOnePlusThreeEnabled && bets.twentyOnePlusThree > 0) {
    if (bets.twentyOnePlusThree < 0) errors.push("Invalid 21+3 bet amount");
    totalBet += bets.twentyOnePlusThree;
  }

  if (settings.perfectPairsEnabled && bets.perfectPairs > 0) {
    if (bets.perfectPairs < 0) errors.push("Invalid perfect pairs bet amount");
    totalBet += bets.perfectPairs;
  }

  if (settings.betBehindEnabled) {
    if (bets.betBehindBet < 0) errors.push("Invalid bet behind amount");
    totalBet += bets.betBehindBet;

    if (!bets.betBehindTarget && bets.betBehindBet > 0) {
      errors.push("Invalid bet behind target");
    }
  }

  if (totalBet > balance) {
    errors.push("Insufficient funds");
  }

  return errors;
}

export function getCardValue(card: Card): number {
  const rank = getRank(card);
  if (rank === "A") return 11;
  if (["T", "J", "Q", "K"].includes(rank)) return 10;
  return parseInt(rank);
}

export const getCardTotal = (
  cards: Card[]
): {
  ace: "SOFT" | "HARD" | "NONE";
  total: number;
} => {
  let total = 0;
  let aceCount = 0;
  for (let card of cards) {
    if (getRank(card) === "-") continue;
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
