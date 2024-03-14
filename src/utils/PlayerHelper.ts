import { Player } from "@/types/Player";

export function getPlayer(id: string, players: Player[]): Player | undefined {
  return players.find((p) => p.id === id);
}
