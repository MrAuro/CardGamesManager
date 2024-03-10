// conditional types based on Scope

import { CardRank_NOEMPTY, CardSuit_NOEMPTY } from "./Card";

export type CardInputs =
  | CardRank_NOEMPTY
  | CardSuit_NOEMPTY
  | `${CardRank_NOEMPTY}${CardSuit_NOEMPTY}`;

export type Scope = "None" | "Blackjack PreRound" | "Blackjack Round" | "Blackjack PostRound";
export const Scopes: Scope[] = [
  "None",
  "Blackjack PreRound",
  "Blackjack Round",
  "Blackjack PostRound",
];

export type BlackjackPreRoundActions = "Start Game";
export type BlackjackRoundActions =
  | CardInputs
  | "Payout & End"
  | "Next Turn"
  | "Refund & Cancel"
  | "Hit"
  | "Stand"
  | "Double"
  | "Split";
export type BlackjackPostRoundActions = "Next Round";

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
        "Payout & End",
        "Next Turn",
        "Refund & Cancel",
        "Hit",
        "Stand",
        "Double",
        "Split",
        ...availableRanks,
        ...availableSuits,
        ...availableCards,
      ];
    case "Blackjack PostRound":
      return ["Next Round"];
    case "None":
      return ["None"];
  }
}
