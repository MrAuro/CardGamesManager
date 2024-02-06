import {
  Center,
  Paper,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { Card, EMPTY_CARD, getRank, getSuit, suitToIcon } from "../utils/Card";
import { IconClick, IconHandFinger, IconPlus } from "@tabler/icons-react";

export default function PlayingCard(props: {
  card: Card;
  onClick: () => void;
  disabled?: boolean;
}) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  let backgroundColor;
  if (colorScheme == "dark") {
    if (!props.disabled) {
      backgroundColor = theme.colors.dark[7];
    } else if (props.card == EMPTY_CARD) {
      backgroundColor = theme.colors.dark[6];
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
      onClick={() => props.onClick()}
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
