import { Card } from "./Card";

export type GameState = "PREROUND" | "ROUND" | "POSTROUND";

export const DEFAULT_BLACKJACK_GAME: BlackjackGame = {
  gameState: "PREROUND",
  currentTurn: "",
  dealerCards: [],
  dealerFirstTime: true,
};

export type BlackjackGame = {
  gameState: GameState;
  currentTurn: string;
  dealerCards: Card[];
  dealerFirstTime: boolean;
};

export type EarningsResultType = {
  amount: number;
  blackjackPlayerId: string;
} & (
  | {
      source: "Blackjack";
      result: "BLACKJACK" | "WIN" | "PUSH" | "LOSE";
      split?: boolean;
    }
  | {
      source: "Perfect Pairs";
      result: "Mixed" | "Colored" | "Perfect" | "None";
    }
  | {
      source: "21+3";
      result:
        | "None"
        | "Flush"
        | "Straight"
        | "Three of a Kind"
        | "Straight Flush"
        | "Suited Three of a Kind";
    }
  | {
      source: "Bet Behind";
      result: "BLACKJACK" | "WIN" | "PUSH" | "LOSE";
    }
);

export const DEFAULT_BLACKJACK_SETTINGS: BlackjackSettings = {
  decks: 2,
  dealerHitsSoft17: true,
  doubleAfterSplit: true,
  splitAces: true,
  splitAcesReceiveOneCard: true,

  blackjackPayout: 1.5,

  twentyOnePlusThreeEnabled: false,
  twentyOnePlusThreeFlushPayout: 5,
  twentyOnePlusThreeStraightPayout: 10,
  twentyOnePlusThreeThreeOfAKindPayout: 30,
  twentyOnePlusThreeStraightFlushPayout: 40,
  twentyOnePlusThreeThreeOfAKindSuitedPayout: 100,

  perfectPairsEnabled: false,
  perfectPairsMixedPayout: 6,
  perfectPairsColoredPayout: 12,
  perfectPairsSuitedPayout: 30,

  betBehindEnabled: false,
};

export type BlackjackSettings = {
  decks: number;
  dealerHitsSoft17: boolean;
  doubleAfterSplit: boolean;
  splitAces: boolean;
  splitAcesReceiveOneCard: boolean;

  blackjackPayout: number;

  twentyOnePlusThreeEnabled: boolean;
  twentyOnePlusThreeFlushPayout: number;
  twentyOnePlusThreeStraightPayout: number;
  twentyOnePlusThreeThreeOfAKindPayout: number;
  twentyOnePlusThreeStraightFlushPayout: number;
  twentyOnePlusThreeThreeOfAKindSuitedPayout: number;

  perfectPairsEnabled: boolean;
  perfectPairsMixedPayout: number;
  perfectPairsColoredPayout: number;
  perfectPairsSuitedPayout: number;

  betBehindEnabled: boolean;
};

export const DEFAULT_BLACKJACK_PLAYER: BlackjackPlayer = {
  id: "",
  cards: [],
  bet: 0,
  doubledDown: false,
  split: false,
  displayName: "",
  errors: [],
  sidebets: {
    twentyOnePlusThree: 0,
    perfectPairs: 0,
    betBehind: {
      bet: 0,
      target: null,
    },
  },
};

export type BlackjackPlayer = {
  id: string;
  cards: Card[];
  bet: number;
  doubledDown: boolean;
  split: boolean;
  displayName: string;
  splitFrom?: string; // For split hands, the id of the original player
  errors: string[];
  sidebets: {
    twentyOnePlusThree: number;
    perfectPairs: number;
    betBehind: {
      bet: number;
      target: string | null;
    };
  };
};
