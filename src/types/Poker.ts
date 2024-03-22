import { Card } from "./Card";

export type GameState = "PREROUND" | "BLINDS" | "PREFLOP" | "FLOP" | "TURN" | "RIVER" | "SHOWDOWN";

export type PokerGame = {
  gameState: GameState;
  currentTurn: string;
  communityCards: Card[];
  currentBet: number;
};

export type PokerPlayer = {
  id: string;
  cards: Card[];
  displayName: string;
  folded: boolean;
  currentBet: number;
  allIn: boolean;
};

export type PokerSettings = {
  forcedBetOption: boolean;
  smallBlind: number;
  bigBlind: number;
  ante: number;
};
