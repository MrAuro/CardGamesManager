import GenericPlayerCard from "@/components/GenericPlayerCard";
import PlayingCard from "@/components/PlayingCard";
import { Card } from "@/types/Card";
import {
  Button,
  Container,
  Divider,
  Group,
  Paper,
  Text,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { useRecoilState } from "recoil";
import { CARD_SELECTOR_STATE } from "../routes/Round";
import { getCardTotal } from "@/utils/BlackjackHelper";

export default function DealerCard({
  cards,
  isActive,
  firstTurn,
  nextTurn,
  forceTurn,
  refundAndCancel,
}: {
  cards: Card[];
  isActive: boolean;
  firstTurn: boolean;
  nextTurn: (dealerFirstTurn: boolean) => void;
  forceTurn: (playerId: string) => void;
  refundAndCancel: () => void;
}) {
  const theme = useMantineTheme();
  const [cardSelector, setCardSelector] = useRecoilState(CARD_SELECTOR_STATE);

  const calculatedCardResult = getCardTotal(cards);

  let dealerAction: "hit" | "stand" = "stand";
  // Dealer hits on soft 17, stands on hard 17
  if (calculatedCardResult.ace == "SOFT" && calculatedCardResult.total <= 17) {
    dealerAction = "hit";
  } else if (calculatedCardResult.total < 17) {
    dealerAction = "hit";
  }

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
                {calculatedCardResult.ace !== "NONE" ? calculatedCardResult.ace : ""}
              </Text>
              <Text size={rem(30)} fw="bold" ta="center">
                {calculatedCardResult.total}
              </Text>
              <Text size={rem(14)} fw={600} tt="uppercase" ta="center" mt="3">
                {dealerAction}
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
      <Group grow>
        {firstTurn ? (
          <Button
            disabled={!isActive}
            fullWidth
            onClick={() => {
              nextTurn(false);
            }}
          >
            Next Turn
          </Button>
        ) : (
          <Button disabled={!isActive} fullWidth>
            Add Card
          </Button>
        )}
        <Button
          variant={isActive ? "filled" : "light"}
          fullWidth
          color="red"
          onClick={refundAndCancel}
        >
          Refund & Cancel
        </Button>
        {!firstTurn && isActive && (
          <Button fullWidth color="green">
            Payout & End
          </Button>
        )}
        <Button disabled={isActive} fullWidth color="gray" onClick={() => forceTurn("DEALER")}>
          Force Turn
        </Button>
      </Group>
    </GenericPlayerCard>
  );
}
