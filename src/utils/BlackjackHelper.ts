import { BlackjackSettings } from "@/types/Blackjack";
import { Card } from "@/types/Card";
import { EMPTY_CARD, getRank, getSuit, isAnyEmpty } from "./CardHelper";

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
export const findPerfectPairs = (cards: Card[]): "None" | "Mixed" | "Colored" | "Perfect" => {
  let res: "None" | "Mixed" | "Colored" | "Perfect" = "None";
  if (getRank(cards[0]) !== getRank(cards[1])) {
    return res;
  }

  if (cards[0] !== EMPTY_CARD && cards[1] !== EMPTY_CARD) {
    if (getRank(cards[0]) == getRank(cards[1])) {
      res = "Mixed";
    }

    let card1Color: "red" | "black" | "none" = "none";
    let card2Color: "red" | "black" | "none" = "none";

    card1Color = getSuit(cards[0]) == "h" || getSuit(cards[0]) == "d" ? "red" : "black";
    card2Color = getSuit(cards[1]) == "h" || getSuit(cards[1]) == "d" ? "red" : "black";

    if (card1Color == card2Color) {
      res = "Colored";
    }

    if (getSuit(cards[0]) == getSuit(cards[1])) {
      res = "Perfect";
    }
  }

  return res;
};

type TwentyOnePlusThree =
  | "None"
  | "Flush"
  | "Straight"
  | "Three of a Kind"
  | "Straight Flush"
  | "Suited Three of a Kind";

export const findTwentyOnePlusThree = (cards: Card[]): TwentyOnePlusThree => {
  let res: TwentyOnePlusThree = "None";

  for (let i = 0; i < cards.length; i++) {
    if (isAnyEmpty(cards[i])) {
      return res;
    }
  }

  // Check for flushes
  let flush = false;
  let flushSuit = getSuit(cards[0]);
  for (let i = 1; i < cards.length; i++) {
    if (getSuit(cards[i]) !== flushSuit) {
      flush = false;
      break;
    }
    flush = true;
  }

  if (flush) {
    res = "Flush";
  }

  // Check for straights
  let straight = false;
  let cardRanks = cards.map((card) => getRank(card));
  let cardValuesArr: number[] = [];

  /*
    Low Ace : 1
    2 : 2
    ...
    T : 10
    J : 11
    Q : 12
    K : 13
    High Ace : 14
  */

  for (let i = 0; i < cardRanks.length; i++) {
    switch (cardRanks[i]) {
      case "A":
        cardValuesArr.push(1);
        cardValuesArr.push(14);
        break;

      case "T":
        cardValuesArr.push(10);
        break;

      case "J":
        cardValuesArr.push(11);
        break;

      case "Q":
        cardValuesArr.push(12);
        break;

      case "K":
        cardValuesArr.push(13);
        break;

      default:
        cardValuesArr.push(parseInt(cardRanks[i]));
        break;
    }
  }

  cardValuesArr.sort((a, b) => a - b);

  let straightCount = 1;
  for (let i = 1; i < cardValuesArr.length; i++) {
    if (cardValuesArr[i] - cardValuesArr[i - 1] === 1) {
      straightCount++;
    }
  }

  if (straightCount === 3) {
    straight = true;
    res = "Straight";
  }

  // Check for three of a kinds
  let threeOfAKind = false;
  let threeOfAKindRank = getRank(cards[0]);
  for (let i = 1; i < cards.length; i++) {
    if (getRank(cards[i]) !== threeOfAKindRank) {
      threeOfAKind = false;
      break;
    }
    threeOfAKind = true;
  }

  if (threeOfAKind) {
    res = "Three of a Kind";
  }

  // Check for Straight Flushes
  if (flush && straight) {
    res = "Straight Flush";
  }

  // Check for suited three of a kinds
  if (flush && threeOfAKind) {
    res = "Suited Three of a Kind";
  }

  return res;
};

export function calculateBasePayoutMultiplier(handTotal: number, dealerTotal: number): number {
  let result: "BLACKJACK" | "WIN" | "LOSE" | "PUSH" = "LOSE";

  if (handTotal.total > 21) {
    result = "LOSE";
  } else if (dealerTotal.total == handTotal.total) {
    result = "PUSH";
  } else if (handTotal.total == 21) {
    result = "BLACKJACK";
  } else if (dealerTotal.total > 21) {
    result = "WIN";
  } else if (dealerTotal.total > handTotal.total) {
    result = "LOSE";
  } else if (dealerTotal.total < handTotal.total) {
    result = "WIN";
  }
}
