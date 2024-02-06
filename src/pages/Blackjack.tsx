import { Button, Divider, Group, Text, Title } from "@mantine/core";
import { useState } from "react";
import { STATE, State } from "../App";
import PlayerListItem from "../components/PlayerListItem";
import PlayerSelector from "../components/PlayingList";
import { getPlayer } from "../utils/Blackjack";
import { useCustomRecoilState } from "../utils/Recoil";

export default function Blackjack() {
  const [state, setState, modifyState] = useCustomRecoilState<State>(STATE);
  const [betErrors, setBetErrors] = useState<(string | null)[]>([]);

  const nextTurn = () => {
    let players = state.blackjack.players;
    let turnIndex = players.findIndex((p) => p.id === state.blackjack.turn);
    let nextTurnIndex = (turnIndex + 1) % players.length;
    modifyState({
      blackjack: {
        turn: players[nextTurnIndex].id,
      },
    });
  };

  let content = null;
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
          {state.blackjack.players.map((player) => {
            let isTurn = state.blackjack.turn === player.id;

            return (
              <PlayerListItem
                player={getPlayer(player, state.players)}
                editPlayer={null}
                key={player.id}
                my="xs"
                disabled={!isTurn}
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

  return content;
}
