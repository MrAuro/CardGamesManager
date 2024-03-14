import { Paper, Text, useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { Card, EMPTY_CARD, getRank, getSuit, suitToIcon } from "../utils/CardHelper";

export default function PlayingCard(props: {
  card: Card;
  onClick: (card: Card) => void;
  disabled?: boolean;
}) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  let backgroundColor;
  if (colorScheme == "dark") {
    if (!props.disabled) {
      if (props.card == EMPTY_CARD) {
        backgroundColor = theme.colors.dark[7];
      } else {
        backgroundColor = theme.colors.gray[0];
      }
    } else if (props.card == EMPTY_CARD) {
      backgroundColor = theme.colors.dark[6];
    } else {
      backgroundColor = theme.colors.gray[0];
    }
  } else {
    if (!props.disabled) {
      backgroundColor = theme.colors.gray[1];
    } else if (props.card == EMPTY_CARD) {
      backgroundColor = theme.colors.gray[0];
    }
  }

  let iconColor;
  if (colorScheme == "dark") {
    iconColor = theme.colors.dark[3];
  } else {
    iconColor = theme.colors.gray[5];
  }

  return (
    <Paper
      withBorder
      shadow="md"
      style={{
        width: "4.5rem",
        height: "4.5rem",
        backgroundColor: backgroundColor,

        cursor: props.disabled ? "pointer" : "not-allowed",
      }}
      onClick={() => {
        if (props.disabled) {
          props.onClick(props.card);
        }
      }}
    >
      {props.card == EMPTY_CARD ? (
        <>
          <Text
            size="xl"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            {props.disabled ? <IconPlus color={iconColor} /> : null}
          </Text>
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
            style={{
              verticalAlign: "middle",
              display: "flex",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            {suitToIcon(getSuit(props.card))}
            {getRank(props.card)}
          </Text>
        </div>
      )}
    </Paper>
  );
}
