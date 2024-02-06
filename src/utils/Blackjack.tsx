import { useRecoilValue } from "recoil";
import { Card } from "./Card";
import { STATE } from "../App";
import { Player } from "../types/Player";

export type BlackjackGameState = "NONE" | "PLAYING" | "GAME_OVER";

export type BlackjackPlayer = {
  id: string;
  cards: Card[];
  bet: number;
};

export const getPlayer = (
  idOrPlayer: string | BlackjackPlayer,
  players: Player[]
): Player => {
  let id: string = typeof idOrPlayer === "string" ? idOrPlayer : idOrPlayer.id;

  let player = players.find((player: Player) => player.id === id);
  if (player == null) {
    throw new Error(`Player with id ${id} not found`);
  }

  return player;
};
