import { UUID } from "crypto";

export type Player = {
  id: UUID;
  name: string;
  balance: number;
};
