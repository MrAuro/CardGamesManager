import { Card } from "./Card";

export type GameState = "PREROUND" | "ROUND" | "POSTROUND";

export type BlackjackGame = {
  gameState: GameState;
  currentTurn: string;
  dealerCards: Card[];
  dealerFirstTime: boolean;
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

export type BlackjackPlayer = {
  id: string;
  cards: Card[];
  bet: number;
  doubledDown: boolean;
  split: boolean;
  displayName: string;
  splitFrom?: string; // For split hands, the id of the original player
  sidebets: {
    twentyOnePlusThree: number;
    perfectPairs: number;
    betBehind: {
      bet: number;
      target: string | null;
    };
  };
};
