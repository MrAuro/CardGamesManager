import {
  Divider,
  Group,
  Paper,
  useMantineColorScheme,
  useMantineTheme,
  Text,
} from "@mantine/core";
import PlayingCard from "./PlayingCard";
import ImprovedCardPicker from "./ImprovedCardPicker";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { useRecoilState } from "recoil";
import { STATE, State } from "../App";
import { Card } from "../utils/Game";

export default function ImprovedCommunityCards() {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const [state, setState] = useRecoilState<State>(STATE);

  const [cardPickerOpened, cardPickerOpenedHandlers] = useDisclosure(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(0);

  return (
    <>
      <Paper
        withBorder
        radius="md"
        mb="xs"
        px="sm"
        styles={{
          root: {
            backgroundColor:
              colorScheme == "dark"
                ? theme.colors.dark[7]
                : theme.colors.gray[0],
          },
        }}
      >
        <Text size="xl" mt="xs" ta="center" fw="bold">
          Community Cards
        </Text>
        <Text ta="center">Pot: ${18.45}</Text>
        <Divider my="sm" />
        <ImprovedCardPicker
          opened={cardPickerOpened}
          handleClose={(card: Card) => {
            cardPickerOpenedHandlers.close();

            let _cards = [...state.communityCards];
            _cards[selectedCardIndex] = {
              suit: card.suit,
              rank: card.rank,
            };

            setState({ ...state, communityCards: _cards });
          }}
        />
        <Group justify="center" my="sm" mb="md">
          {
            // @ts-ignore
            state.communityCards.map((card, i) => (
              <PlayingCard
                key={i}
                card={{ suit: card.suit, rank: card.rank }}
                onClick={() => {
                  setSelectedCardIndex(i);
                  cardPickerOpenedHandlers.open();
                }}
              />
            ))
          }
        </Group>
      </Paper>
    </>
  );
}
