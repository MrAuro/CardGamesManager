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
import { USED_CARDS } from "../App";
import {
  Card,
  CardRank,
  CardSuit,
  EMPTY_CARD,
  suitToIcon,
} from "../utils/Game";

export default function ImprovedCardPicker(props: {
  opened: boolean;
  handleClose: (card: Card) => void;
}) {
  const [selectedCardRank, setSelectedCardRank] = useState<CardRank>("NONE");
  const [selectedCardSuit, setSelectedCardSuit] = useState<CardSuit>("NONE");

  useEffect(() => {
    if (selectedCardRank != "NONE" && selectedCardSuit != "NONE") {
      props.handleClose({ rank: selectedCardRank, suit: selectedCardSuit });
      setSelectedCardRank("NONE");
      setSelectedCardSuit("NONE");
    }
  }, [selectedCardRank, selectedCardSuit]);

  const handleClose = (card: Card) => {
    props.handleClose(card);
    setSelectedCardRank("NONE");
    setSelectedCardSuit("NONE");
  };

  return (
    <Modal
      opened={props.opened}
      onClose={() => {
        if (selectedCardRank != "NONE" && selectedCardSuit != "NONE") {
          props.handleClose({ rank: selectedCardRank, suit: selectedCardSuit });
        } else {
          props.handleClose(EMPTY_CARD);
        }
      }}
      title="Select a card"
    >
      <Group grow>
        <SimpleGrid cols={{ sm: 7, xs: 2 }} spacing="xs" verticalSpacing="xs">
          {[
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "T",
            "J",
            "Q",
            "K",
            "A",
          ].map((rank) => (
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
            rank="NONE"
            selectedCardRank={selectedCardRank}
            selectedCardSuit={selectedCardSuit}
            setSelectedCardRank={setSelectedCardRank}
            setSelectedCardSuit={setSelectedCardSuit}
            label={<IconBan size="1.25rem" stroke="0.2rem" />}
            onClick={() => props.handleClose(EMPTY_CARD)}
          />
        </SimpleGrid>
      </Group>
      <Divider my="md" />
      <Group justify="center" grow>
        <SimpleGrid cols={{ sm: 4, xs: 2 }} spacing="xs" verticalSpacing="xs">
          {["hearts", "diamonds", "clubs", "spades"].map((suit) => (
            <SuitButton
              key={suit}
              suit={suit as CardSuit}
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
  const usedCards = useRecoilValue(USED_CARDS);
  const theme = useMantineTheme();

  const [selected, setSelected] = useState(false);
  const [disabled, setDisabled] = useState(
    usedCards.some(
      (card) => card.rank == props.rank && card.suit == props.selectedCardSuit
    )
  );
  useEffect(() => {
    setSelected(props.selectedCardRank == props.rank);
    setDisabled(
      usedCards.some(
        (card) => card.rank == props.rank && card.suit == props.selectedCardSuit
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
      color="gray.0"
      variant={selected ? "filled" : "outline"}
      disabled={disabled}
      onClick={() => {
        props.setSelectedCardRank(props.rank);
        if (props.onClick) {
          props.onClick();
        }
      }}
      styles={{
        root: {
          color: selected ? theme.colors.gray[9] : theme.colors.gray[0],
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
  const usedCards = useRecoilValue(USED_CARDS);
  const theme = useMantineTheme();

  const [selected, setSelected] = useState(false);
  const [disabled, setDisabled] = useState(
    usedCards.some(
      (card) => card.rank == props.selectedCardRank && card.suit == props.suit
    )
  );
  useEffect(() => {
    setSelected(props.selectedCardSuit == props.suit);
    setDisabled(
      usedCards.some(
        (card) => card.rank == props.selectedCardRank && card.suit == props.suit
      )
    );
  }, [props.selectedCardSuit, props.selectedCardRank, usedCards]);

  let color: "red" | "gray" =
    props.suit == "hearts" || props.suit == "diamonds" ? "red" : "gray";

  let iconColor;
  if (color == "red") {
    if (disabled) {
      iconColor = theme.colors.gray[7];
    } else if (selected) {
      iconColor = theme.colors.gray[0];
    } else {
      iconColor = "#ff2626";
    }
  } else if (color == "gray") {
    if (disabled) {
      iconColor = theme.colors.gray[7];
    } else if (selected) {
      iconColor = theme.colors.gray[9];
    } else {
      iconColor = theme.colors.gray[0];
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
      color={
        props.suit == "hearts" || props.suit == "diamonds"
          ? "#ff2626"
          : "gray.0"
      }
      styles={{
        icon: {
          color: `${iconColor}`,
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