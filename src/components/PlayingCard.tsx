import { Card } from "@/types/Card";
import { getSuit, suitToIcon, getRank, EMPTY_CARD } from "@/utils/CardHelper";
import { Paper, useMantineTheme, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

export default function PlayingCard({
  card,
  onClick,
  disabled,
}: {
  card: Card;
  onClick: (card: Card) => void;
  disabled: boolean;
}) {
  const theme = useMantineTheme();

  let backgroundColor;
  if (!disabled) {
    if (card == EMPTY_CARD) {
      backgroundColor = theme.colors.dark[7];
    } else {
      backgroundColor = theme.colors.gray[0];
    }
  } else if (card == EMPTY_CARD) {
    backgroundColor = theme.colors.dark[6];
  } else {
    backgroundColor = theme.colors.gray[0];
  }

  return (
    <Paper
      withBorder
      shadow="md"
      style={{
        width: "4.5rem",
        height: "4.5rem",
        backgroundColor: backgroundColor,

        cursor: disabled ? "pointer" : "not-allowed",
      }}
      onClick={() => {
        if (disabled) {
          onClick(card);
        }
      }}
    >
      {card == EMPTY_CARD ? (
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
            {disabled ? <IconPlus color={theme.colors.dark[3]} /> : null}
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
              getSuit(card) === "h" || getSuit(card) === "d"
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
            {suitToIcon(getSuit(card))}
            {getRank(card)}
          </Text>
        </div>
      )}
    </Paper>
  );
}
