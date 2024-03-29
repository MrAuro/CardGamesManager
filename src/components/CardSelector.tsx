import { SETTINGS_STATE } from "@/Root";
import { USED_CARDS } from "@/pages/Poker/routes/Round";
import { Card, CardRank, CardSuit } from "@/types/Card";
import { EMPTY_CARD, getRank, getSuit, isAnyEmpty, suitToIcon } from "@/utils/CardHelper";
import {
  ActionIcon,
  Button,
  Divider,
  Group,
  Modal,
  SimpleGrid,
  useMantineTheme,
} from "@mantine/core";
import { IconBan } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

export default function CardSelector({
  opened,
  intitialCard,
  activeCardOverride,
  onSubmit,
  strictCards,
}: {
  opened: boolean;
  intitialCard?: Card;
  activeCardOverride?: Card;
  onSubmit: (card: Card) => void;
  strictCards?: boolean;
}) {
  const [selectedCardRank, setSelectedCardRank] = useState<CardRank>("-");
  const [selectedCardSuit, setSelectedCardSuit] = useState<CardSuit>("-");

  useEffect(() => {
    if (activeCardOverride) {
      if (getRank(activeCardOverride) != "-") {
        setSelectedCardRank(getRank(activeCardOverride));
      }

      if (getSuit(activeCardOverride) != "-") {
        setSelectedCardSuit(getSuit(activeCardOverride));
      }
    }
  }, [activeCardOverride]);

  useEffect(() => {
    if (intitialCard) {
      setSelectedCardRank(getRank(intitialCard));
      setSelectedCardSuit(getSuit(intitialCard));
    }
  }, [opened]);

  useEffect(() => {
    if (!isAnyEmpty(`${selectedCardRank}${selectedCardSuit}`) && opened) {
      if (intitialCard && intitialCard != EMPTY_CARD) {
        if (
          getRank(intitialCard) != selectedCardRank ||
          getSuit(intitialCard) != selectedCardSuit
        ) {
          onSubmit(`${selectedCardRank}${selectedCardSuit}`);
        }
      } else {
        onSubmit(`${selectedCardRank}${selectedCardSuit}`);
      }
    }
  }, [selectedCardRank, selectedCardSuit]);

  return (
    <Modal
      opened={opened}
      onClose={() => {
        if (selectedCardRank != "-" && selectedCardSuit != "-") {
          onSubmit(`${selectedCardRank}${selectedCardSuit}`);
        } else {
          onSubmit(EMPTY_CARD);
        }
      }}
      title="Select a card"
    >
      <Group grow>
        <SimpleGrid cols={{ sm: 7, xs: 2 }} spacing="xs" verticalSpacing="xs">
          {["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"].map((rank) => (
            <RankButton
              key={rank}
              rank={rank as CardRank}
              selectedCardRank={selectedCardRank}
              selectedCardSuit={selectedCardSuit}
              setSelectedCardRank={setSelectedCardRank}
              setSelectedCardSuit={setSelectedCardSuit}
            />
          ))}
          <RankButton
            rank="-"
            selectedCardRank={selectedCardRank}
            selectedCardSuit={selectedCardSuit}
            setSelectedCardRank={setSelectedCardRank}
            setSelectedCardSuit={setSelectedCardSuit}
            label={<IconBan size="1.25rem" stroke="0.2rem" />}
            onClick={() => onSubmit(EMPTY_CARD)}
          />
        </SimpleGrid>
      </Group>
      <Divider my="md" />
      <Group justify="center" grow>
        <SimpleGrid cols={{ sm: 4, xs: 2 }} spacing="xs" verticalSpacing="xs">
          {(["h", "s", "d", "c"] as CardSuit[]).map((suit) => (
            <SuitButton
              key={suit}
              suit={suit}
              selectedCardRank={selectedCardRank}
              selectedCardSuit={selectedCardSuit}
              setSelectedCardSuit={setSelectedCardSuit}
            />
          ))}
        </SimpleGrid>
      </Group>
    </Modal>
  );
}

function RankButton(props: {
  rank: CardRank;
  selectedCardRank: CardRank;
  selectedCardSuit: CardSuit;
  setSelectedCardRank: (rank: CardRank) => void;
  setSelectedCardSuit: (suit: CardSuit) => void;
  label?: React.ReactNode;
  onClick?: () => void;
}) {
  const theme = useMantineTheme();

  const usedCards = useRecoilValue(USED_CARDS);
  const [disabled, setDisabled] = useState(
    usedCards.some((card) => getRank(card) == props.rank && getSuit(card) == props.selectedCardSuit)
  );

  const [selected, setSelected] = useState(false);
  useEffect(() => {
    setSelected(props.selectedCardRank == props.rank);
    setDisabled(
      usedCards.some(
        (card) => getRank(card) == props.rank && getSuit(card) == props.selectedCardSuit
      )
    );
  }, [props.selectedCardSuit, props.selectedCardRank, usedCards]);

  return (
    <Button
      radius="md"
      size="compact-xl"
      fullWidth
      p="xs"
      fw="bolder"
      justify="center"
      color={selected ? "white" : disabled ? "dark" : "white"}
      variant={selected ? "filled" : "outline"}
      disabled={!selected && disabled}
      onClick={() => {
        props.setSelectedCardRank(props.rank);
        if (props.onClick) {
          props.onClick();
        }
      }}
      styles={{
        root: {
          color: selected
            ? theme.colors.gray[9]
            : disabled
            ? theme.colors.dark[4]
            : theme.colors.indigo[0],
        },
        label: {},
      }}
    >
      {props.label || props.rank}
    </Button>
  );
}

function SuitButton(props: {
  suit: CardSuit;
  selectedCardRank: CardRank;
  selectedCardSuit: CardSuit;
  setSelectedCardSuit: (suit: CardSuit) => void;
}) {
  const theme = useMantineTheme();
  const settings = useRecoilValue(SETTINGS_STATE);

  const usedCards = useRecoilValue(USED_CARDS);
  const [disabled, setDisabled] = useState(
    usedCards.some((card) => getRank(card) == props.selectedCardRank && getSuit(card) == props.suit)
  );

  const [selected, setSelected] = useState(false);
  useEffect(() => {
    setSelected(props.selectedCardSuit == props.suit);
    setDisabled(
      usedCards.some(
        (card) => getRank(card) == props.selectedCardRank && getSuit(card) == props.suit
      )
    );
  }, [props.selectedCardSuit, props.selectedCardRank, usedCards]);

  let color: "red" | "gray" | "blue" | "green" =
    props.suit == "h" || props.suit == "d" ? "red" : "gray";
  if (settings.fourColorDeck) {
    if (props.suit == "d") {
      color = "blue";
    } else if (props.suit == "c") {
      color = "green";
    }
  }

  let iconColor;
  if (color == "red") {
    if (selected) {
      iconColor = theme.colors.gray[0];
    } else {
      iconColor = "#ff2626";
    }
  } else if (color == "gray") {
    if (selected) {
      iconColor = theme.colors.gray[9];
    } else {
      iconColor = theme.colors.gray[0];
    }
  } else if (color == "blue") {
    if (selected) {
      iconColor = theme.colors.gray[0];
    } else {
      iconColor = theme.colors.blue[6];
    }
  } else if (color == "green") {
    if (selected) {
      iconColor = theme.colors.gray[0];
    } else {
      iconColor = theme.colors.green[7];
    }
  }

  return (
    <ActionIcon
      radius="sm"
      size="xl"
      variant={selected ? "filled" : "outline"}
      disabled={disabled}
      onClick={() => {
        props.setSelectedCardSuit(props.suit);
      }}
      // Cheaty way to get the color to what is best here
      color={
        disabled ? theme.colors.dark[3] : color.replace("gray", "white").replace("red", "#ff2626")
      }
      styles={{
        icon: {
          color: disabled ? theme.colors.dark[4] : iconColor,
        },
      }}
      style={{
        width: "100%",
      }}
    >
      {suitToIcon(props.suit)}
    </ActionIcon>
  );
}
