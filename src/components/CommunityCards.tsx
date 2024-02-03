import {
  Divider,
  Group,
  Paper,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import PlayingCard from "./PlayingCard";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import {
  CardSuit,
  CardRank,
  rankToName,
  suitToName,
  Card,
} from "../utils/Game";
import CardPicker from "./CardPicker";
import { showNotification } from "@mantine/notifications";
import { STATE, STATE_WATCHER, State } from "../App";
import { useRecoilState, useRecoilValue } from "recoil";

export default function CommunityCards(props: { cards: Card[] }) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const [setCardModelOpened, { open: openSetCard, close: closeSetCard }] =
    useDisclosure(false);
  const [setCardSuit, setSetCardSuit] = useState<CardSuit>("NONE");
  const [setCardRank, setSetCardRank] = useState<CardRank>("NONE");
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(0);
  const [cards, setCards] = useState<Card[]>(props.cards);
  const [state, setState] = useRecoilState(STATE);
  const val = useRecoilValue<State>(STATE_WATCHER);

  const saveCard = () => {
    console.log("Card set", selectedCardIndex);

    let _cards = [...cards];
    if (setCardRank == "NONE" || setCardSuit == "NONE")
      _cards[selectedCardIndex] = { suit: "NONE", rank: "NONE" };
    else _cards[selectedCardIndex] = { suit: setCardSuit, rank: setCardRank };

    setCards(_cards);
    console.log(_cards);
    closeSetCard();
    setSelectedCardIndex(0);

    if (setCardRank == "NONE" || setCardSuit == "NONE") {
      showNotification({
        title: "Card Set",
        message: `Card removed`,
        color: "blue",
      });
    } else {
      setSetCardRank("NONE");
      setSetCardSuit("NONE");

      showNotification({
        title: "Card Set",
        message: `Card set to ${rankToName(setCardRank)} of ${suitToName(
          setCardSuit
        )}`,
        color: "blue",
      });
    }

    setState({ ...state, communityCards: _cards });
  };

  return (
    <Paper
      withBorder
      radius="md"
      mb="xs"
      px="sm"
      styles={{
        root: {
          backgroundColor:
            colorScheme == "dark" ? theme.colors.dark[7] : theme.colors.gray[0],
        },
      }}
    >
      <Text size="xl" mt="xs" ta="center" fw="bold">
        Community Cards
      </Text>
      <Text ta="center">Pot: ${18.45}</Text>
      <Divider my="sm" />
      <CardPicker
        setCardModelOpened={setCardModelOpened}
        saveCard={saveCard}
        setCardRank={setCardRank}
        setSetCardRank={setSetCardRank}
        setSetCardSuit={setSetCardSuit}
        setCardSuit={setCardSuit}
      />
      <Group justify="center" my="sm" mb="md">
        {
          // @ts-ignore
          cards.map((card, index) => (
            <PlayingCard
              key={index}
              card={{ suit: card.suit, rank: card.rank }}
              removeCard={() => {}}
              openSetCardModal={() => {
                setSelectedCardIndex(index);
                openSetCard();
              }}
            />
          ))
        }
      </Group>
    </Paper>
  );
}
