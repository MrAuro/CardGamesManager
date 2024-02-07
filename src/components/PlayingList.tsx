import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import {
  Button,
  Divider,
  Grid,
  Group,
  NumberInput,
  Select,
  Text,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { IconCurrencyDollar, IconSearch } from "@tabler/icons-react";
import cx from "clsx";
import { useEffect, useState } from "react";
import { STATE, State } from "../App";
import classes from "../styles/PlayingList.module.css";
import { BlackjackPlayer, getPlayer } from "../utils/BlackjackHelper";
import { useCustomRecoilState } from "../utils/RecoilHelper";
import PlayerListItem from "./PlayerListItem";

export default function PlayerSelector({
  betErrors,
  setBetErrors,
}: {
  betErrors: (string | null)[];
  setBetErrors: React.Dispatch<React.SetStateAction<(string | null)[]>>;
}) {
  const [state, setState, modifyState] = useCustomRecoilState<State>(STATE);
  const theme = useMantineTheme();

  const [listState, handlers] = useListState<string>(state.blackjack.players.map((p) => p.id));

  // From the Mantine Discord
  // https://discord.com/channels/854810300876062770/1202574436516237323/1202575107290304522
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>();
  useEffect(() => {
    setSelectedPlayer(null);
  }, [selectedPlayer]);

  useEffect(() => {
    let orderedPlayers = listState.map((id) => state.blackjack.players.find((p) => p.id === id)!);

    orderedPlayers = orderedPlayers.filter((p) => p != undefined);

    setState({
      ...state,
      blackjack: {
        ...state.blackjack,
        players: orderedPlayers,
      },
    });
  }, [listState]);

  const [playerNodes, setPlayerNodes] = useState<React.ReactNode[]>([]);
  useEffect(() => {
    let _playerNodes: React.ReactNode[] = [];
    listState.map((id, index) => {
      let _player = state.players.find((p) => p.id === id);
      if (!_player) {
        console.warn("Player not found - removed", id);
        // remove the player from the list
        setState({
          ...state,
          blackjack: {
            ...state.blackjack,
            players: state.blackjack.players.filter((p) => p.id !== id),
          },
        });
        return;
      }

      let bjPlayer = state.blackjack.players.find((p) => p.id === id);
      if (!bjPlayer) {
        console.warn("Blackjack player not found - removed", id);
        // remove the player from the list
        setState({
          ...state,
          blackjack: {
            ...state.blackjack,
            players: state.blackjack.players.filter((p) => p.id !== id),
          },
        });
        return;
      }

      _playerNodes.push(
        <Draggable key={id} index={index} draggableId={id}>
          {(provided, snapshot) => (
            <div
              className={cx(classes.item, {
                [classes.dragging]: snapshot.isDragging,
              })}
              {...provided.draggableProps}
              ref={provided.innerRef}
            >
              {bjPlayer ? (
                <PlayerListItem
                  player={_player!}
                  editPlayer={null}
                  key={_player!.id}
                  showHandle
                  provided={provided}
                >
                  <Divider my="xs" />
                  {/* We don't use the label prop on NumberInput as it shifts the buttons */}
                  <Text size="sm" fw={500} mb={rem(2)} ml={rem(2)}>
                    Bet Amount
                  </Text>
                  <Grid>
                    <Grid.Col span={3}>
                      <NumberInput
                        radius="md"
                        decimalScale={2}
                        fixedDecimalScale
                        thousandSeparator=","
                        value={bjPlayer.bet}
                        error={betErrors[index]}
                        onChange={(value) => {
                          if (_player == null) return;

                          let bet = parseFloat(`${value}`);
                          if (isNaN(bet)) {
                            setBetErrors((prev) => {
                              let _prev = [...prev];
                              _prev[index] = "Invalid number";
                              return _prev;
                            });
                            return;
                          }

                          if (bet < 0) {
                            setBetErrors((prev) => {
                              let _prev = [...prev];
                              _prev[index] = "Bet cannot be negative";
                              return _prev;
                            });
                            return;
                          }

                          if (bet > _player.balance) {
                            setBetErrors((prev) => {
                              let _prev = [...prev];
                              _prev[index] = "Bet cannot exceed balance";
                              return _prev;
                            });
                            return;
                          }

                          // We allow 0 bets in case the player doesnt want to bet but still wants to play

                          setBetErrors((prev) => {
                            let _prev = [...prev];
                            _prev[index] = null;
                            return _prev;
                          });

                          modifyState({
                            blackjack: {
                              players: state.blackjack.players.map((p) => {
                                if (bjPlayer)
                                  if (p.id === bjPlayer.id) {
                                    return { ...p, bet };
                                  }
                                return p;
                              }),
                            },
                          });
                        }}
                        leftSection={<IconCurrencyDollar />}
                      />
                    </Grid.Col>
                    <Grid.Col span={9}>
                      <Button.Group>
                        <Button
                          variant="light"
                          fullWidth
                          disabled={bjPlayer.bet + 5 > _player!.balance}
                          style={{
                            backgroundColor:
                              bjPlayer.bet + 5 > _player!.balance
                                ? theme.colors.dark[5]
                                : undefined,
                          }}
                          onClick={() => {
                            if (betErrors[index]) {
                              modifyState({
                                blackjack: {
                                  players: state.blackjack.players.map((p) => {
                                    if (bjPlayer)
                                      if (p.id === bjPlayer.id) {
                                        return { ...p, bet: 5 };
                                      }
                                    return p;
                                  }),
                                },
                              });

                              setBetErrors((prev) => {
                                let _prev = [...prev];
                                _prev[index] = null;
                                return _prev;
                              });
                            } else {
                              modifyState({
                                blackjack: {
                                  players: state.blackjack.players.map((p) => {
                                    if (bjPlayer)
                                      if (p.id === bjPlayer.id) {
                                        return { ...p, bet: p.bet + 5 };
                                      }
                                    return p;
                                  }),
                                },
                              });
                            }
                          }}
                        >
                          +5
                        </Button>
                        <Button
                          variant="light"
                          fullWidth
                          disabled={bjPlayer.bet * 2 > _player!.balance || bjPlayer.bet * 2 == 0}
                          style={{
                            backgroundColor:
                              bjPlayer.bet * 2 > _player!.balance || bjPlayer.bet * 2 == 0
                                ? theme.colors.dark[5]
                                : undefined,
                          }}
                          onClick={() => {
                            modifyState({
                              blackjack: {
                                players: state.blackjack.players.map((p) => {
                                  if (bjPlayer)
                                    if (p.id === bjPlayer.id) {
                                      return { ...p, bet: p.bet * 2 };
                                    }
                                  return p;
                                }),
                              },
                            });
                          }}
                        >
                          X2
                        </Button>
                        <Button
                          variant="light"
                          fullWidth
                          disabled={bjPlayer.bet / 2 == 0}
                          style={{
                            backgroundColor:
                              bjPlayer.bet / 2 == 0 ? theme.colors.dark[5] : undefined,
                          }}
                          onClick={() => {
                            modifyState({
                              blackjack: {
                                players: state.blackjack.players.map((p) => {
                                  if (bjPlayer)
                                    if (p.id === bjPlayer.id) {
                                      return {
                                        ...p,
                                        bet: Math.floor((p.bet / 2) * 100) / 100,
                                      };
                                    }
                                  return p;
                                }),
                              },
                            });
                          }}
                        >
                          1/2
                        </Button>
                        <Button
                          variant="light"
                          fullWidth
                          disabled={bjPlayer.bet == _player!.balance}
                          style={{
                            backgroundColor:
                              bjPlayer.bet / 2 == 0 ? theme.colors.dark[5] : undefined,
                          }}
                          onClick={() => {
                            modifyState({
                              blackjack: {
                                players: state.blackjack.players.map((p) => {
                                  if (bjPlayer)
                                    if (p.id === bjPlayer.id) {
                                      return {
                                        ...p,
                                        bet: getPlayer(p.id, state.players).balance,
                                      };
                                    }
                                  return p;
                                }),
                              },
                            });
                          }}
                        >
                          Max
                        </Button>
                        <Button
                          fullWidth
                          variant="light"
                          color="red"
                          onClick={() => {
                            // modifyState doesn't work here for some reason
                            if (bjPlayer) {
                              setState({
                                ...state,
                                blackjack: {
                                  ...state.blackjack,
                                  players: state.blackjack.players.filter(
                                    (p) => p.id !== bjPlayer?.id
                                  ),
                                },
                              });

                              let index = listState.indexOf(bjPlayer.id);
                              if (index != -1) {
                                handlers.remove(index);
                              }
                            }
                          }}
                        >
                          Sit Out
                        </Button>
                      </Button.Group>
                    </Grid.Col>
                  </Grid>
                </PlayerListItem>
              ) : (
                "Edge case"
              )}
            </div>
          )}
        </Draggable>
      );
    });

    setPlayerNodes(_playerNodes);
  }, [state.blackjack.players, betErrors]);

  return (
    <>
      <Select
        key={selectedPlayer}
        placeholder="Add Player"
        leftSectionPointerEvents="none"
        leftSection={<IconSearch size="1.25rem" />}
        clearable
        searchable
        radius="md"
        mb="sm"
        value={selectedPlayer}
        data={state.players
          .map((player) => ({
            value: player.id,
            label: `${player.name} ($${player.balance.toFixed(2)})`,
          }))
          .filter((player) => {
            return !state.blackjack.players.some((p) => p.id === player.value);
          })}
        onChange={(_value, option) => {
          setSelectedPlayer(option.value);
          modifyState({
            blackjack: {
              players: [
                ...state.blackjack.players,
                {
                  id: option.value,
                  bet: 0,
                  cards: [],
                  doubledDown: false,
                  split: false,
                } as BlackjackPlayer,
              ],
            },
          });

          handlers.append(option.value);
        }}
      />
      {state.blackjack.players.length > 0 ? (
        <DragDropContext
          onDragEnd={({ destination, source }) => {
            handlers.reorder({
              from: source.index,
              to: destination?.index || 0,
            });
          }}
        >
          <Droppable droppableId="dnd-list" direction="vertical">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {playerNodes}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <Text mt="xs" c="dimmed">
          No players added
        </Text>
      )}
    </>
  );
}
