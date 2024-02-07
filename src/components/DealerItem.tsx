import {
  Box,
  Container,
  Group,
  Paper,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { STATE, State } from "../App";
import { useCustomRecoilState } from "../utils/RecoilHelper";
import PlayingCard from "./PlayingCard";
import { useScrollIntoView, usePrevious } from "@mantine/hooks";
import { useEffect } from "react";

export default function DealerItem(props: {
  my?: string;
  disabled?: boolean;
  leftCardItem?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const [state] = useCustomRecoilState<State>(STATE);

  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
    offset: 60,
    duration: 200,
    easing: (t) => t * (2 - t),
  });

  const previousTurn = usePrevious(state.blackjack.turn);
  useEffect(() => {
    if (previousTurn !== state.blackjack.turn && state.blackjack.turn == "DEALER") {
      console.log("Turn changed to", state.blackjack.turn);
      scrollIntoView({
        alignment: "start",
      });
    }
  }, [state.blackjack.turn]);

  return (
    <Paper
      withBorder
      radius="md"
      my={props.my ?? undefined}
      p="xs"
      ref={targetRef}
      styles={{
        root: {
          // height: "3rem",
          backgroundColor:
            colorScheme === "dark"
              ? !props.disabled
                ? theme.colors.dark[6]
                : theme.colors.dark[7]
              : !props.disabled
              ? theme.colors.gray[0]
              : theme.colors.gray[1],
          display: "flex", // Add this line to make the container a flex container
          alignItems: "center", // Vertically center the items
        },
      }}
    >
      <Container
        style={{
          flex: 1,
          justifyContent: "space-between",
        }}
        pl="sm"
      >
        <Group justify="space-between">
          <Paper style={{ backgroundColor: "transparent" }}>
            <Text size="xl" fw={!props.disabled ? "bolder" : "bold"} tt="capitalize">
              Dealer
            </Text>
            <Text>
              Seen Cards:{" "}
              {[...state.blackjack.seenCards, ...state.blackjack.pastGameSeenCards].length}/
              {state.blackjack.deckCount * 52}
            </Text>
            <Text>
              True Count:{" "}
              {(
                state.blackjack.runningCount /
                ((state.blackjack.deckCount * 52 -
                  [...state.blackjack.seenCards, ...state.blackjack.pastGameSeenCards].length) /
                  52)
              ).toFixed(1)}
            </Text>
          </Paper>

          <Paper
            style={{
              backgroundColor: "transparent",

              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Box ml="xs">{props.leftCardItem}</Box>
            {state.blackjack.dealerCards.map((card, index) => (
              <Box ml="xs" key={`DEALER${card}${index}`}>
                <PlayingCard card={card} onClick={() => {}} disabled={!props.disabled} />
              </Box>
            ))}
          </Paper>
        </Group>
        {props.children}
      </Container>
    </Paper>
  );
}
