// conditional types based on Scope

import { CardRank_NOEMPTY, CardSuit_NOEMPTY } from "./Card";

export type CardInputs =
  | CardRank_NOEMPTY
  | CardSuit_NOEMPTY
  | `${CardRank_NOEMPTY}${CardSuit_NOEMPTY}`;

export type Scope =
  | "None"
  | "Blackjack PreRound"
  | "Blackjack Round"
  | "Blackjack PostRound"
  | "Poker PreRound"
  | "Poker Round"
  | "Poker Round (Capturing Bets)";
export const Scopes: Scope[] = [
  "None",
  "Blackjack PreRound",
  "Blackjack Round",
  "Blackjack PostRound",
  "Poker PreRound",
  "Poker Round",
  "Poker Round (Capturing Bets)",
];

export type BlackjackPreRoundActions = "Start Game";
export type BlackjackRoundActions =
  | CardInputs
  | "Next Turn"
  | "Refund & Cancel"
  | "Hit"
  | "Double"
  | "Split"
  | "Remove Last Card";
export type BlackjackPostRoundActions = "Next Round";

export type PokerPreRoundActions =
  | "Start Game"
  | "Shuffle Players"
  | "Random Dealer"
  | "Next Dealer";
export type PokerRoundActions = CardInputs | "Check / Call" | "Fold" | "Bet / Raise";
// TODO: Add ability for chip input when Chip mode is enabled
export type PokerRoundCapturingBetsActions = "Cancel" | "Confirm" | "All In" | "Pot";

export type Keybinding = {
  id: string;
  key: string;
} & (
  | {
      action: BlackjackPreRoundActions;
      scope: "Blackjack PreRound";
    }
  | {
      action: BlackjackRoundActions;
      scope: "Blackjack Round";
    }
  | {
      action: BlackjackPostRoundActions;
      scope: "Blackjack PostRound";
    }
  | {
      action: PokerPreRoundActions;
      scope: "Poker PreRound";
    }
  | {
      action: PokerRoundActions;
      scope: "Poker Round";
    }
  | {
      action: PokerRoundCapturingBetsActions;
      scope: "Poker Round (Capturing Bets)";
    }
  | {
      action: "None";
      scope: "None";
    }
);

const availableRanks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"];
const availableSuits = ["h", "s", "d", "c"];

export const availableCards = availableRanks.flatMap((rank) =>
  availableSuits.map((suit) => `${rank}${suit}`)
);

export function getActions(scope: Scope): string[] {
  switch (scope) {
    case "Blackjack PreRound":
      return ["Start Game"];
    case "Blackjack Round":
      return [
        "Next Turn",
        "Refund & Cancel",
        "Hit",
        "Double",
        "Split",
        "Remove Last Card",
        ...availableRanks,
        ...availableSuits,
        ...availableCards,
      ];
    case "Blackjack PostRound":
      return ["Next Round"];
    case "Poker PreRound":
      return ["Start Game", "Shuffle Players", "Random Dealer", "Next Dealer"];
    case "Poker Round":
      return [
        "Check / Call",
        "Fold",
        "Bet / Raise",
        ...availableRanks,
        ...availableSuits,
        ...availableCards,
      ];
    case "Poker Round (Capturing Bets)":
      return ["Cancel", "Confirm", "All In", "Pot"];
    case "None":
      return ["None"];
  }
}
