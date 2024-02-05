import {
  Center,
  Paper,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { Card, suitToIcon } from "../utils/Game";

export default function PlayingCard(props: {
  card: Card;
  onClick: () => void;
  disabled?: boolean;
}) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  return (
    <Paper
      withBorder
      shadow="md"
      style={{
        width: "4.5rem",
        height: "4.5rem",
        backgroundColor:
          props.card.suit == "NONE"
            ? colorScheme == "dark"
              ? theme.colors.dark[6]
              : theme.colors.gray[4]
            : colorScheme == "dark"
            ? theme.colors.gray[0]
            : theme.colors.gray[1],
        cursor: props.disabled ? "not-allowed" : "pointer",
      }}
      onClick={() => {
        if (!props.disabled) {
          props.onClick();
        }
      }}
    >
      {props.card.suit == "NONE" ? (
        <>
          <Center style={{ height: "100%" }}>
            <Text size="xl" ta="center"></Text>
          </Center>
        </>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Text
            size="2rem"
            fw={800}
            ta="center"
            c={
              props.card.suit === "hearts" || props.card.suit === "diamonds"
                ? theme.colors.red[6]
                : theme.colors.dark[5]
            }
          >
            <div
              style={{
                verticalAlign: "middle",
                display: "flex",
                alignContent: "center",
                alignItems: "center",
              }}
            >
              {suitToIcon(props.card.suit)}
              {props.card.rank}
            </div>
          </Text>
        </div>
      )}
    </Paper>
  );
}
