import {
  Center,
  Paper,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import {
  IconClubsFilled,
  IconDiamondsFilled,
  IconHeartFilled,
  IconSpadeFilled,
} from "@tabler/icons-react";
import { Card } from "../utils/Game";

export default function PlayingCard(props: {
  card: Card;
  removeCard: (card: Card) => void;
  openSetCardModal: (card: Card) => void;
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
        cursor: "pointer",
      }}
      onClick={() => props.openSetCardModal(props.card)}
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

const suitToIcon = (name: string): React.ReactNode => {
  let size = "1.7rem";

  switch (name) {
    case "hearts":
      return <IconHeartFilled size={size} />;
    case "diamonds":
      return <IconDiamondsFilled size={size} />;
    case "clubs":
      return <IconClubsFilled size={size} />;
    case "spades":
      return <IconSpadeFilled size={size} />;
  }
};
