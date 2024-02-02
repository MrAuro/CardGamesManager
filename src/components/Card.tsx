import { Paper, Text, useMantineTheme } from "@mantine/core";
import Twemoji from "react-twemoji";

export function Card(props: CardType) {
  const theme = useMantineTheme();

  return (
    <div>
      <Paper
        withBorder
        shadow="xs"
        radius="md"
        style={{
          backgroundColor: theme.colors.gray[0],
          borderColor: theme.colors.dark[9],
          borderWidth: "3px",
        }}
      >
        <Text
          m="xs"
          size="xl"
          fw={800}
          c={
            props.suit === "hearts" || props.suit === "diamonds"
              ? "red.8"
              : "dark.8"
          }
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Twemoji options={{ className: "twemoji" }}>
              {nameToEmoji(props.suit)} {props.value}
            </Twemoji>
          </div>
        </Text>
      </Paper>
    </div>
  );
}

export type CardType = {
  value:
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "10"
    | "J"
    | "Q"
    | "K"
    | "A";
  suit: "hearts" | "diamonds" | "clubs" | "spades";
};

const nameToEmoji = (name: string) => {
  switch (name) {
    case "hearts":
      return "♥";
    case "diamonds":
      return "♦";
    case "clubs":
      return "♣";
    case "spades":
      return "♠";
  }
};
