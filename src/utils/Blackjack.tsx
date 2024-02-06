import { Card } from "./Card";

export type BlackjackGameState =
  | "NONE"
  | "COLLECTING_BETS"
  | "INSURANCE"
  | "PLAYERS_TURN"
  | "DEALERS_TURN"
  | "GAME_OVER";

export type BlackjackPlayer = {
  id: string;
  cards: Card[];
  bet: number;
};
