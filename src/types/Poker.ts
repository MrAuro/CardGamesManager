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
  capturingCommunityCards: boolean;
  runningThroughShowdown: boolean; // Everyone (or everyone minus one) has gone all in and we're just showing the cards
  currentBets: {
    [playerId: string]: {
      amount: number;
      dontAddToPot: boolean;
    };
  };
};

export type PlayerResult = {
  handRank: string | null;
  hand: string | null;
  ties: number;
  tiesPercentage: string;
  win: number;
  winPercentage: string;
};

export type StoredPlayerResult = {
  id: string;
  result: PlayerResult;
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
  /**
   * @deprecated
   */
  maximum?: number;
  closed: boolean;
};
