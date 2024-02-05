import {
  Divider,
  Group,
  Paper,
  useMantineColorScheme,
  useMantineTheme,
  Text,
  Button,
  Center,
} from "@mantine/core";
import PlayingCard from "./PlayingCard";
import ImprovedCardPicker from "./ImprovedCardPicker";
import { useDisclosure } from "@mantine/hooks";
import { ReactNode, useState } from "react";
import { useRecoilState } from "recoil";
import { GameState, STATE, State } from "../App";
import { Card, EMPTY_CARD, Player, PlayerPosition } from "../utils/Game";

export default function ImprovedCommunityCards() {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const [state, setState] = useRecoilState<State>(STATE);

  const [cardPickerOpened, cardPickerOpenedHandlers] = useDisclosure(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(0);

  let content: ReactNode;
  switch (state.gameState) {
    case GameState.EDITING:
      content = (
        <Group grow gap="xs" justify="center" mb="sm">
          <Button
            onClick={() => {
              console.log("New round");

              let newPlayers: Player[] = state.players.map((player) => {
                return {
                  ...player,
                  cards: [EMPTY_CARD, EMPTY_CARD] as [Card, Card],
                  position: "NONE" as PlayerPosition,
                };
              });

              for (let playerId of state.foldedPlayers) {
                if (newPlayers.find((player) => player.id == playerId)) {
                  if (
                    newPlayers.find((player) => player.id == playerId)!
                      .balance >=
                    (state.forcedBetType == "ANTE"
                      ? state.ante
                      : state.bigBlind)
                  ) {
                    newPlayers.find(
                      (player) => player.id == playerId
                    )!.isPlaying = true;
                  }
                }
              }

              let playingPlayers = newPlayers.filter(
                (player) =>
                  player.balance >
                    (state.forcedBetType == "ANTE"
                      ? state.ante
                      : state.bigBlind) || player.isPlaying
              );

              if (playingPlayers.length < 2) {
                alert("Not enough eligible players to play");
                return;
              }

              if (
                state.forcedBetType == "BLINDS" &&
                playingPlayers.length < 3
              ) {
                alert(
                  "Not enough players to play with blinds, switching to antes"
                );
                let ante = 1;
                if (state.ante == 0 && state.bigBlind != 0)
                  ante = state.bigBlind;
                setState({ ...state, forcedBetType: "ANTE", ante });
              }

              // let newDealerIndex = (state.dealerIndex + 1) % state.players.length;

              // // update the positions
              // if (state.forcedBetType == "BLINDS") {
              //   newPlayers[newDealerIndex].position = "btn";
              //   newPlayers[(newDealerIndex + 1) % newPlayers.length].position =
              //     "sb";
              //   newPlayers[(newDealerIndex + 2) % newPlayers.length].position =
              //     "bb";
              // }

              let newDealerIndex = -1;
              for (
                let i = state.dealerIndex + 1;
                i < state.players.length + state.dealerIndex;
                i++
              ) {
                let j = i % state.players.length;
                if (
                  state.players[j].balance >=
                  (state.forcedBetType == "ANTE" ? state.ante : state.bigBlind)
                ) {
                  if (state.players[j].isPlaying) {
                    newDealerIndex = j;
                    break;
                  }
                }
              }

              if (newDealerIndex == -1) {
                alert("No eligible players to play");
                return;
              } else {
                console.log("New dealer index", newDealerIndex);
                newPlayers[newDealerIndex].position = "btn" as PlayerPosition;
              }

              if (state.forcedBetType == "BLINDS") {
                for (
                  let i = newDealerIndex + 1;
                  i < newPlayers.length + newDealerIndex;
                  i++
                ) {
                  let j = i % newPlayers.length;
                  if (
                    newPlayers[j].balance >= state.bigBlind &&
                    newPlayers[j].isPlaying &&
                    newPlayers[j].position == "NONE"
                  ) {
                    newPlayers[j].position = "sb" as PlayerPosition;
                    break;
                  }
                }

                for (
                  let i = newDealerIndex + 2;
                  i < newPlayers.length + newDealerIndex;
                  i++
                ) {
                  let j = i % newPlayers.length;
                  if (
                    newPlayers[j].balance >= state.bigBlind &&
                    newPlayers[j].isPlaying &&
                    newPlayers[j].position == "NONE"
                  ) {
                    newPlayers[j].position = "bb" as PlayerPosition;
                    break;
                  }
                }
              }

              let newCurrentPlayerIndex = -1;
              for (
                let i = newDealerIndex + 1;
                i < newPlayers.length + newDealerIndex;
                i++
              ) {
                let j = i % newPlayers.length;
                if (
                  newPlayers[j].balance >=
                    (state.forcedBetType == "ANTE"
                      ? state.ante
                      : state.bigBlind) &&
                  newPlayers[j].isPlaying
                ) {
                  newCurrentPlayerIndex = j;
                  break;
                }
              }

              setState({
                ...state,
                gameState: GameState.PREROUND,
                currentPlayerIndex: newCurrentPlayerIndex,
                dealerIndex: newDealerIndex,
                pots: [],
                communityCards: new Array(5).fill({
                  suit: "NONE",
                  rank: "NONE",
                }),
                players: newPlayers,
                sbPaid: false,
                bbPaid: false,
                antesPaid: [],
                foldedPlayers: [],
                checkedPlayers: [],
                currentBet: 0,
              });
            }}
          >
            Start New Round
          </Button>
        </Group>
      );
      break;

    case GameState.PREROUND:
      content = (
        <>
          <Text ta="center" size="lg" fw="bold" mb="sm">
            {`Collecting ${state.forcedBetType == "ANTE" ? "Antes" : "Blinds"}`}
          </Text>
          <Center>
            <Button
              color="red"
              mb="sm"
              onClick={() => {
                setState({ ...state, gameState: GameState.EDITING });
              }}
            >
              Cancel Game
            </Button>
          </Center>
        </>
      );
  }

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
        <Divider my="sm" />
        {content}
      </Paper>
    </>
  );
}
