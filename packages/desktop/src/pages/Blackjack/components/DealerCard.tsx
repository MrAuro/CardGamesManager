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
import { useRecoilState, useRecoilValue } from "recoil";
import { CARD_SELECTOR_STATE } from "../routes/Round";
import { getCardTotal, getHandResult } from "@/utils/BlackjackHelper";
import { useScrollIntoView } from "@mantine/hooks";
import { useEffect } from "react";
import { BLACKJACK_GAME_STATE, BLACKJACK_PLAYERS_STATE } from "@/Root";
import { SPEECH_SYNTHESIS_MESSAGE } from "@/App";
import { EMPTY_CARD } from "@/utils/CardHelper";

export default function DealerCard({
  cards,
  isActive,
  firstTurn,
  nextTurn,
  forceTurn,
  refundAndCancel,
  payoutAndEnd,
}: {
  cards: Card[];
  isActive: boolean;
  firstTurn: boolean;
  nextTurn: (dealerFirstTurn: boolean) => void;
  forceTurn: (playerId: string) => void;
  refundAndCancel: () => void;
  payoutAndEnd: () => void;
}) {
  const theme = useMantineTheme();
  const [cardSelector, setCardSelector] = useRecoilState(CARD_SELECTOR_STATE);
  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
    offset: 100,
    duration: 500,
  });

  const [blackjackGame, setBlackjackGame] = useRecoilState(BLACKJACK_GAME_STATE);
  const blackjackPlayers = useRecoilValue(BLACKJACK_PLAYERS_STATE);
  const [, setSpeechSynthesisMessage] = useRecoilState(SPEECH_SYNTHESIS_MESSAGE);

  useEffect(() => {
    if (isActive) {
      scrollIntoView({
        alignment: "start",
      });
    }
  }, [isActive]);

  const calculatedCardResult = getCardTotal(cards);

  let dealerAction: "hit" | "stand" = "stand";
  // Dealer hits on soft 17, stands on hard 17
  if (calculatedCardResult.ace == "SOFT" && calculatedCardResult.total <= 17) {
    dealerAction = "hit";
  } else if (calculatedCardResult.total < 17) {
    dealerAction = "hit";
  }

  useEffect(() => {
    if (isActive) {
      let textToSpeak = "";
      if (calculatedCardResult.total > 21) {
        textToSpeak = "Bust";
      } else if (calculatedCardResult.total == 21) {
        textToSpeak = "Blackjack";
      } else {
        if (!(blackjackGame.dealerCards.filter((card) => card != EMPTY_CARD).length < 2)) {
          // The semicolon is used to add a slight pause between the dealer action and the total
          if (dealerAction == "stand") {
            let playerResults = [];
            for (let player of blackjackPlayers) {
              const result = getHandResult(
                getCardTotal(player.cards).total,
                calculatedCardResult.total
              );
              if (result == "WIN") {
                playerResults.push(`${player.displayName} wins`);
              } else if (result == "LOSE") {
                playerResults.push(`${player.displayName} loses`);
              } else if (result == "PUSH") {
                playerResults.push(`${player.displayName} pushes`);
              } else if (result == "BLACKJACK") {
                playerResults.push(`${player.displayName} has blackjack`);
              }
            }

            if (playerResults.every((result) => result.includes("pushes"))) {
              textToSpeak = "Everybody push";
            } else if (playerResults.every((result) => result.includes("blackjack"))) {
              textToSpeak = "Everybody has blackjack";
            } else if (playerResults.every((result) => result.includes("wins"))) {
              textToSpeak = "Everybody wins";
            } else if (playerResults.every((result) => result.includes("loses"))) {
              textToSpeak = "Everybody loses";
            } else {
              textToSpeak = `${dealerAction}; ${calculatedCardResult.total}; ${playerResults
                .reverse()
                .join("; ")}`;
            }
          } else {
            textToSpeak = `${dealerAction}; ${calculatedCardResult.total}`;
          }
        }
      }

      setSpeechSynthesisMessage(textToSpeak);
    }
  }, [blackjackGame.dealerCards, isActive]);

  return (
    <div ref={targetRef}>
      <GenericPlayerCard
        header="Dealer"
        backgroundColor={isActive ? theme.colors.dark[6] : theme.colors.dark[7]}
        styles={{
          cursor: isActive ? "default" : "pointer",
        }}
        onClick={() => {
          if (isActive) return;

          forceTurn("DEALER");
        }}
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
            <Button
              disabled={!isActive}
              fullWidth
              onClick={() => {
                setBlackjackGame({
                  ...blackjackGame,
                  dealerCards: [...blackjackGame.dealerCards, "--"],
                });
              }}
            >
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
            <Button fullWidth color="green" onClick={payoutAndEnd}>
              Payout & End
            </Button>
          )}
        </Group>
      </GenericPlayerCard>
    </div>
  );
}
