import { Button, Divider, Group, Text, Title } from "@mantine/core";
import { ReactNode, useState } from "react";
import { STATE, State } from "../App";
import PlayerListItem from "../components/PlayerListItem";
import PlayerSelector from "../components/PlayingList";
import { getPlayer } from "../utils/Blackjack";
import { useCustomRecoilState } from "../utils/Recoil";
import DealerItem from "../components/DealerItem";
import { Card, EMPTY_CARD } from "../utils/Card";
import CardPicker from "../components/CardPicker";

export default function Blackjack() {
  const [state, setState, modifyState] = useCustomRecoilState<State>(STATE);
  const [betErrors, setBetErrors] = useState<(string | null)[]>([]);

  const [showCardPicker, setShowCardPicker] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [cardPlayer, setCardPlayer] = useState("");

  const nextTurn = () => {
    let players = state.blackjack.players;
    let turnIndex = players.findIndex((p) => p.id === state.blackjack.turn);

    let nextTurnIndex = turnIndex + 1;
    if (nextTurnIndex >= players.length) {
      modifyState({
        blackjack: {
          turn: "DEALER",
        },
      });
    } else {
      modifyState({
        blackjack: {
          turn: players[nextTurnIndex].id,
        },
      });
    }
  };

  let content: ReactNode = "No content";
  switch (state.blackjack.state) {
    case "NONE":
      content = (
        <>
          <Button
            fullWidth
            mt="sm"
            disabled={
              state.blackjack.players.length <= 0 ||
              betErrors.filter((p) => p !== null).length > 0
            }
            onClick={() => {
              modifyState({
                blackjack: {
                  state: "PLAYING",
                  turn: state.blackjack.players[0].id,
                  dealerCards: [EMPTY_CARD, EMPTY_CARD],
                  players: state.blackjack.players.map((p) => {
                    return {
                      ...p,
                      cards: [EMPTY_CARD, EMPTY_CARD],
                    };
                  }),
                },
              });
            }}
          >
            Start Game
          </Button>
          {state.blackjack.players.length <= 0 ? (
            <Text ta="center" c="red" size="sm" mt="xs">
              You need at least one player to start a game
            </Text>
          ) : (
            betErrors.filter((p) => p !== null).length > 0 && (
              <Text ta="center" c="red" size="sm" mt="xs">
                Players have invalid bets
              </Text>
            )
          )}
          <Divider my="md" />
          <Title order={2} mb="sm">
            Players
          </Title>
          <PlayerSelector betErrors={betErrors} setBetErrors={setBetErrors} />
        </>
      );
      break;
    case "PLAYING":
      content = (
        <>
          <DealerItem disabled={state.blackjack.turn !== "DEALER"} />
          {state.blackjack.players.map((player) => {
            let isTurn = state.blackjack.turn === player.id;

            return (
              <PlayerListItem
                player={getPlayer(player, state.players)}
                editPlayer={null}
                key={player.id}
                my="xs"
                disabled={!isTurn}
                showBlackjackCards
                onCardClick={(card, index) => {
                  setShowCardPicker(true);
                  setCardIndex(index);
                  setCardPlayer(player.id);
                }}
              >
                <Divider my="xs" />
                <Group grow>
                  <Button fullWidth size="sm" color="blue" disabled={!isTurn}>
                    Hit
                  </Button>
                  <Button
                    fullWidth
                    size="sm"
                    color="green"
                    disabled={!isTurn}
                    onClick={nextTurn}
                  >
                    Stand
                  </Button>
                  <Button fullWidth size="sm" color="red" disabled={!isTurn}>
                    Double
                  </Button>
                  <Button fullWidth size="sm" color="grape" disabled={!isTurn}>
                    Split
                  </Button>
                </Group>
              </PlayerListItem>
            );
          })}
        </>
      );
      break;
  }

  return (
    <>
      <CardPicker
        opened={showCardPicker}
        setOpened={setShowCardPicker}
        handleClose={(card) => {
          if (card != null) {
            let player = state.blackjack.players.find(
              (p) => p.id === cardPlayer
            );
            if (player != null) {
              console.log(player.cards, cardIndex, card);
              let newCards: Card[] = [...player.cards];
              newCards[cardIndex] = card;
              modifyState({
                blackjack: {
                  players: state.blackjack.players.map((p) => {
                    if (p.id === cardPlayer) {
                      return {
                        ...p,
                        cards: newCards,
                      };
                    }
                    return p;
                  }),
                },
              });
              setShowCardPicker(false);
              setCardPlayer("");
              setCardIndex(0);
            }
          }
        }}
      />
      {content}
    </>
  );
}
