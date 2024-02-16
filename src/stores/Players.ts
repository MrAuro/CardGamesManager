import { atom } from "recoil";
import { Player } from "../types/Player";

export const PLAYERS_STATE = atom<Player[]>({
  key: "PLAYERS",
  default: [],
});
