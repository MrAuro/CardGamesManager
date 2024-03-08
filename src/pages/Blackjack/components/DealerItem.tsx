import GenericPlayerCard from "@/components/GenericPlayerCard";
import PlayingCard from "@/components/PlayingCard";
import { Card } from "@/types/Card";
import { Button, Container, Divider, Paper, Text, rem } from "@mantine/core";

export default function DealerItem({ cards }: { cards: Card[] }) {
  return (
    <GenericPlayerCard
      header="Dealer"
      rightSection={
        <>
          <Paper
            style={{
              width: "4.5rem",
              height: "4.5rem",
              backgroundColor: "transparent",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <Text size={rem(14)} fw={600} tt="uppercase" ta="center">
                BLACKJACK
              </Text>
              <Text size={rem(30)} fw="bold" ta="center">
                21
              </Text>
              <Text size={rem(14)} fw={600} tt="uppercase" ta="center" mt="3">
                STAND
              </Text>
            </div>
          </Paper>
          {cards.map((card, index) => (
            <Container p={0} m={0} pl="xs">
              <PlayingCard key={index} card={card} onClick={() => {}} disabled={true} />
            </Container>
          ))}
        </>
      }
    >
      <Divider my="xs" />
      <Button fullWidth>Button</Button>
    </GenericPlayerCard>
  );
}
