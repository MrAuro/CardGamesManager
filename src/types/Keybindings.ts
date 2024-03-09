// conditional types based on Scope

export type CardInputs =
  | "Ace"
  | "Two"
  | "Three"
  | "Four"
  | "Five"
  | "Six"
  | "Seven"
  | "Eight"
  | "Nine"
  | "Ten"
  | "Jack"
  | "Queen"
  | "King";

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

export function getActions(scope: Scope): string[] {
  switch (scope) {
    case "Blackjack PreRound":
      return ["Start Game"];
    case "Blackjack Round":
      return [
        "Ace",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
        "Seven",
        "Eight",
        "Nine",
        "Ten",
        "Jack",
        "Queen",
        "King",
        "Payout & End",
        "Next Turn",
        "Refund & Cancel",
        "Hit",
        "Stand",
        "Double",
        "Split",
      ];
    case "Blackjack PostRound":
      return ["Next Round"];
    case "None":
      return ["None"];
  }
}
