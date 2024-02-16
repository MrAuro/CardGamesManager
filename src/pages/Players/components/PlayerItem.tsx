import { Player } from "@/types/Player";
import { Paper, Text } from "@mantine/core";

export default function PlayerItem({ player }: { player: Player }) {
  return (
    <Paper withBorder shadow="md">
      <Text>{player.name}</Text>
    </Paper>
  );
}
