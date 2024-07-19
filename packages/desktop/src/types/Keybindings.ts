// conditional types based on Scope

import { formatMoney } from "@/utils/MoneyHelper";
import { CardRank_NOEMPTY, CardSuit_NOEMPTY } from "./Card";
import { Chip } from "./Settings";

export type CardInputs =
  | CardRank_NOEMPTY
  | CardSuit_NOEMPTY
  | `${CardRank_NOEMPTY}${CardSuit_NOEMPTY}`;

export type Scope =
  | "None"
  | "Selectors"
  | "Chips Menu"
  | "Blackjack PreRound"
  | "Blackjack Round"
  | "Blackjack PostRound"
  | "Poker PreRound"
  | "Poker Round"
  | "Camera Menu";
export const Scopes: Scope[] = [
  "None",
  "Selectors",
  "Chips Menu",
  "Blackjack PreRound",
  "Blackjack Round",
  "Blackjack PostRound",
  "Poker PreRound",
  "Poker Round",
  "Camera Menu",
];

export type SelectorsActions = "A (hold)" | "A (toggle)" | "B (hold)" | "B (toggle)";

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
export type PokerRoundActions =
  | CardInputs
  | "Check / Call"
  | "Fold"
  | "Bet / Raise"
  | "All In"
  | "Cancel Bet"
  | "Remove Last Card"
  | "Draw Random Card";

type ChipTitle = `${string} ${string} (${string})`;
export type ChipsMenuActions =
  | "Flatten"
  | "Clear"
  | "Remove Last Chip"
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | ChipTitle;

export type CameraMenuActions = "Capture" | "Add Card";

export type Keybinding = {
  id: string;
  key: string;
  selector: "A" | "B" | "None";
} & (
  | {
      action: SelectorsActions;
      scope: "Selectors";
    }
  | {
      action: ChipsMenuActions;
      scope: "Chips Menu";
    }
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
      action: CameraMenuActions;
      scope: "Camera Menu";
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

export function getActions(scope: Scope, chips: Chip[]): string[] {
  switch (scope) {
    case "Selectors":
      return ["A (hold)", "A (toggle)", "B (hold)", "B (toggle)"];
    case "Chips Menu":
      return [
        "Move to Calculator",
        "Bet/Raise/Set Balance",
        "Clear",
        "Flatten",
        "Remove Last Chip",
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        ...chips.map(
          (chip) => `${chip.color} (${formatMoney(chip.denomination, true, true)}) (${chip.id})`
        ),
      ];
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
        "All In",
        "Cancel Bet",
        "Remove Last Card",
        "Draw Random Card",
        ...availableRanks,
        ...availableSuits,
        ...availableCards,
      ];
    case "Camera Menu":
      return ["Capture", "Add Card"];
    case "None":
      return ["None"];
  }
}
