import PlayerSelector from "@/components/PlayerSelector";
import { Draggable, DraggableStateSnapshot } from "@hello-pangea/dnd";
import { Button, Card, Divider, Title, useMantineTheme } from "@mantine/core";
import { IconArrowsShuffle } from "@tabler/icons-react";

function getStyle(style: any, snapshot: DraggableStateSnapshot) {
  if (!snapshot.isDropAnimating) {
    return style;
  }
  const { curve, duration } = snapshot.dropAnimation!;

  return {
    ...style,
    opacity: snapshot.isDragging && !snapshot.isDropAnimating ? 0.65 : 1,
    transition: `all ${curve} ${duration + 500}ms`,
  };
}

export default function PreRound() {
  const theme = useMantineTheme();

  return (
    <>
      <Button fullWidth mt="sm">
        Start Game
      </Button>
      <Button fullWidth mt="sm" variant="light" leftSection={<IconArrowsShuffle />}>
        Shuffle Deck
      </Button>
      <Divider my="md" />
      <Title order={2} mb="sm">
        Players
      </Title>
      <PlayerSelector
        game="BLACKJACK"
        playerElement={(index, player, blackjackPlayer) => {
          if (!blackjackPlayer) return <></>;

          return (
            <Draggable key={player.id} index={index} draggableId={player.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={{
                    ...getStyle(provided.draggableProps.style, snapshot),
                    isDragging: snapshot.isDragging && !snapshot.isDropAnimating,
                    marginBottom: theme.spacing.sm,
                    opacity: snapshot.isDragging && !snapshot.isDropAnimating ? 0.65 : 1,
                  }}
                >
                  <Card withBorder radius="md">
                    {player.name}
                  </Card>
                </div>
              )}
            </Draggable>
          );
        }}
      />
    </>
  );
}
