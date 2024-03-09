import GenericPlayerCard from "@/components/GenericPlayerCard";
import PlayingCard from "@/components/PlayingCard";
import { Card } from "@/types/Card";
import { Button, Container, Divider, Paper, Text, rem, useMantineTheme } from "@mantine/core";
import { useRecoilState } from "recoil";
import { CARD_SELECTOR_STATE } from "../routes/Round";

export default function DealerItem({
  cards,
  isActive,
}: {
  cards: Card[];
  isActive: boolean;
  firstTurn: boolean;
}) {
  const theme = useMantineTheme();
  const [cardSelector, setCardSelector] = useRecoilState(CARD_SELECTOR_STATE);

  return (
    <GenericPlayerCard
      header="Dealer"
      backgroundColor={isActive ? theme.colors.dark[6] : theme.colors.dark[7]}
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
            <Container p={0} m={0} pl="xs" key={`${card}-${index}`}>
              <PlayingCard
                key={index}
                card={card}
                onClick={() => {
                  setCardSelector({
                    ...cardSelector,
                    intitalCard: card,
                    opened: true,
                    onSubmitTarget: "DEALER",
                    onSubmitIndex: index,
                  });
                }}
                disabled={isActive}
              />
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
