import { Card } from "./Card";

export type GameState = "PREROUND" | "BLINDS" | "PREFLOP" | "FLOP" | "TURN" | "RIVER" | "SHOWDOWN";

export const DEFAULT_POKER_GAME: PokerGame = {
  gameState: "PREROUND",
  currentTurn: "",
  communityCards: [],
  currentBet: 0,
  currentDealer: "",
  currentSmallBlind: "",
  currentBigBlind: "",
  pots: [],
  capturingCommunityCards: false,
  runningThroughShowdown: false,
  runningItTwice: false,
  currentBets: {},
  initialBalances: {},
};

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
  runningItTwice: boolean;
  currentBets: {
    [playerId: string]: PokerCurrentBet;
  };
  initialBalances: Record<string, number>; // Player ID to initial balance
};

export const DEFAULT_POKER_POT: PokerPot = {
  eligiblePlayers: [],
  amount: 0,
  closed: false,
  winnerOverrides: [],
};

export type PokerPot = {
  eligiblePlayers: string[];
  amount: number;
  /**
   * @deprecated
   */
  maximum?: number;
  closed: boolean;
  winnerOverrides: string[];
};

export const DEFAULT_POKER_CURRENT_BET: PokerCurrentBet = {
  amount: 0,
  dontAddToPot: false,
};

export type PokerCurrentBet = {
  amount: number;
  dontAddToPot: boolean;
};
export const DEFAULT_POKER_RESULT: PlayerResult = {
  handRank: null,
  hand: null,
  ties: 0,
  tiesPercentage: "0%",
  win: 0,
  winPercentage: "0%",
};

export type PlayerResult = {
  handRank: string | null;
  hand: string | null;
  ties: number;
  tiesPercentage: string;
  win: number;
  winPercentage: string;
};

export const DEFAULT_STORED_PLAYER_RESULT: StoredPlayerResult = {
  id: "",
  result: DEFAULT_POKER_RESULT,
};

export type StoredPlayerResult = {
  id: string;
  result: PlayerResult;
};

export const DEFAULT_POKER_PLAYER: PokerPlayer = {
  id: "",
  cards: [],
  displayName: "",
  folded: false,
  currentBet: 0,
  allIn: false,
  beenOn: false,
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

export const DEFAULT_POKER_SETTINGS: PokerSettings = {
  forcedBetOption: "BLINDS",
  smallBlind: 5,
  bigBlind: 10,
  ante: 0,
};

export type PokerSettings = {
  forcedBetOption: "BLINDS" | "ANTE" | "BLINDS+ANTE";
  smallBlind: number;
  bigBlind: number;
  ante: number;
};
