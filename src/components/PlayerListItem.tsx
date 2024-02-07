import {
  Box,
  Container,
  Group,
  Paper,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { IconGripVertical } from "@tabler/icons-react";
import { STATE, State } from "../App";
import classes from "../styles/PlayingList.module.css";
import { Player } from "../types/Player";
import { Card } from "../utils/CardHelper";
import { useCustomRecoilState } from "../utils/RecoilHelper";
import PlayingCard from "./PlayingCard";
import { usePrevious, useScrollIntoView } from "@mantine/hooks";
import { useEffect } from "react";

export default function PlayerListItem(props: {
  player: Player;
  editPlayer: ((player: Player) => void) | null;
  my?: string;
  disabled?: boolean;
  showHandle?: boolean;
  provided?: any;
  blackjackCardsFrom?: string;
  nameOverride?: string;
  leftCardItem?: React.ReactNode;
  onCardClick?: (card: string, index: number) => void;
  children?: React.ReactNode;
}) {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const [state] = useCustomRecoilState<State>(STATE);

  if (props?.player == null) {
    console.warn("player is null", props);
    return;
  }

  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
    offset: 60,
    duration: 200,
    easing: (t) => t * (2 - t),
  });

  const previousTurn = usePrevious(state.blackjack.turn);
  useEffect(() => {
    if (previousTurn !== state.blackjack.turn && state.blackjack.turn == props.player.id) {
      console.log("Turn changed to", state.blackjack.turn);
      scrollIntoView({
        alignment: "end",
      });
    }
  }, [state.blackjack.turn]);

  return (
    <Paper
      withBorder
      radius="md"
      ref={targetRef}
      my={props.my ?? undefined}
      p="xs"
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
          cursor: props.editPlayer != null ? "pointer" : "default",
          display: "flex", // Add this line to make the container a flex container
          alignItems: "center", // Vertically center the items
        },
      }}
      onClick={() => {
        if (props.editPlayer != null) props.editPlayer(props.player);
      }}
    >
      {props.showHandle && (
        <div {...props.provided.dragHandleProps} className={classes.dragHandle}>
          <IconGripVertical style={{ width: "auto" }} />{" "}
        </div>
      )}
      <Container
        style={{
          flex: 1,
          justifyContent: "space-between",
        }}
        pl="sm"
      >
        <Group justify="space-between">
          <Paper style={{ backgroundColor: "transparent" }}>
            <Text
              size={!props.disabled ? "xl" : "lg"}
              fw={!props.disabled ? "bold" : 500}
              tt="capitalize"
            >
              {props.nameOverride ?? props.player.name}
            </Text>
            <Text size="sm" c="dimmed">
              ${props.player.balance.toFixed(2)}
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
            {props.blackjackCardsFrom &&
              state.blackjack.players.map((player) => {
                if (player.id === props.blackjackCardsFrom) {
                  return player.cards.map((card, index) => (
                    <Box ml="xs" key={`${player.id}${card}${index}`}>
                      <PlayingCard
                        card={card}
                        onClick={(card: Card) => {
                          if (props.onCardClick != null) props.onCardClick(card, index);
                        }}
                        disabled={!props.disabled}
                      />
                    </Box>
                  ));
                }
              })}
          </Paper>
        </Group>
        {props.children}
      </Container>
    </Paper>
  );
}
