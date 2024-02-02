import { Paper, Text, useMantineTheme } from "@mantine/core";
import Twemoji from "react-twemoji";
import { Card } from "../utils/Game";

export default function PlayingCard(props: { card: Card }) {
  const theme = useMantineTheme();

  return (
    <div>
      <Paper
        withBorder
        shadow="xs"
        radius="md"
        style={{
          backgroundColor: theme.colors.gray[0],
        }}
      >
        <Text
          m="xs"
          size="xl"
          fw={800}
          c={
            props.card.suit == "hearts" || props.card.suit === "diamonds"
              ? "red.8"
              : "dark.8"
          }
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Twemoji options={{ className: "twemoji" }}>
              {nameToEmoji(props.card.suit)} {props.card.rank}
            </Twemoji>
          </div>
        </Text>
      </Paper>
    </div>
  );
}

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
