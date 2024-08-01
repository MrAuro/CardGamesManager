import { UUID } from "crypto";

export const DEFAULT_PLAYER: Player = {
  id: crypto.randomUUID(),
  name: "",
  balance: 0,
};

export type Player = {
  id: UUID;
  name: string;
  balance: number;
};
