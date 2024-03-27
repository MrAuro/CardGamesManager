import { Card } from "./Card";

export type GameState = "PREROUND" | "BLINDS" | "PREFLOP" | "FLOP" | "TURN" | "RIVER" | "SHOWDOWN";

export type PokerGame = {
  gameState: GameState;
  currentTurn: string;
  communityCards: Card[];
  currentBet: number;
  currentDealer: string;
  currentSmallBlind: string;
  currentBigBlind: string;
  pots: PokerPot[];
  currentBets: {
    [playerId: string]: {
      amount: number;
      dontAddToPot: boolean;
    };
  };
};

export type PokerPlayer = {
  id: string;
  cards: Card[];
  displayName: string;
  folded: boolean;
  currentBet: number;
  allIn: boolean;
  beenOn: boolean; // Whether or not the player has acted in the current round
};

export type PokerSettings = {
  forcedBetOption: "BLINDS" | "ANTE";
  smallBlind: number;
  bigBlind: number;
  ante: number;
};

export type PokerPot = {
  eligiblePlayers: string[];
  amount: number;
  maximum: number;
  closed: boolean;
};
