import { Player } from "@/types/Player";
import { ActionIcon, Container, Group, Paper, Text } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";

export default function PlayerItem({ player, onClick }: { player: Player; onClick: () => void }) {
  return (
    <Paper withBorder shadow="md" mb="xs">
      <Container my="sm">
        <Group justify="space-between">
          <Paper>
            <Text size="xl" fw={500}>
              {player.name}
            </Text>
            <Text size="md">${player.balance.toFixed(2)}</Text>
          </Paper>
          <ActionIcon variant="transparent" color="dark.0" size="xl" radius="md" onClick={onClick}>
            <IconPencil />
          </ActionIcon>
        </Group>
      </Container>
    </Paper>
  );
}
