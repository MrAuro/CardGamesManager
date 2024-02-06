import {
  Center,
  Paper,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { Card, EMPTY_CARD, getRank, getSuit, suitToIcon } from "../utils/Card";

export default function PlayingCard(props: {
  card: Card;
  onClick: () => void;
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
          props.card == EMPTY_CARD
            ? colorScheme == "dark"
              ? theme.colors.dark[6]
              : theme.colors.gray[4]
            : colorScheme == "dark"
            ? theme.colors.gray[0]
            : theme.colors.gray[1],
        cursor: "pointer",
      }}
      onClick={() => props.onClick()}
    >
      {props.card == EMPTY_CARD ? (
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
              getSuit(props.card) === "h" || getSuit(props.card) === "d"
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
              {suitToIcon(getSuit(props.card))}
              {getRank(props.card)}
            </div>
          </Text>
        </div>
      )}
    </Paper>
  );
}
