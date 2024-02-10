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
import { IconCurrencyDollar, IconSearch, IconUserSearch } from "@tabler/icons-react";
import cx from "clsx";
import { useEffect, useState } from "react";
import { STATE, State } from "../App";
import classes from "../styles/PlayingList.module.css";
import { BlackjackPlayer, getPlayer } from "../utils/BlackjackHelper";
import { useCustomRecoilState } from "../utils/RecoilHelper";
import PlayerListItem from "./PlayerListItem";
import { Player } from "../types/Player";

export default function PlayerSelector({
  betErrors,
  setBetErrors,
  sideBetErrors,
  playerBetErrors,
  setPlayerBetErrors,
  checkForSideBetErrors,
}: {
  betErrors: { id: string; msg: string }[];
  setBetErrors: (betErrors: { id: string; msg: string }[]) => void;
  sideBetErrors: { id: string; msg: string; sideBet: string }[];
  playerBetErrors: { id: string; msg: string }[];
  setPlayerBetErrors: (playerBetErrors: { id: string; msg: string }[]) => void;
  checkForSideBetErrors: (player: BlackjackPlayer, sideBets: string[], value: number) => void;
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
      if (!_player) return;

      let bjPlayer = state.blackjack.players.find((p) => p.id === id);
      if (!bjPlayer) return;

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
                  <Divider mb="xs" />
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
                        error={
                          betErrors.find((e) => e.id === _player!.id)?.msg ||
                          playerBetErrors.find((e) => e.id === _player!.id)?.msg
                        }
                        onChange={(value) => {
                          if (_player == null) return;

                          let foundErrs = false;
                          let bet = parseFloat(`${value}`);
                          if (isNaN(bet)) {
                            foundErrs = true;
                            setBetErrors([
                              ...betErrors,
                              {
                                id: _player.id,
                                msg: "Invalid bet amount",
                              },
                            ]);
                          }

                          if (bet < 0) {
                            foundErrs = true;

                            setBetErrors([
                              ...betErrors,
                              {
                                id: _player.id,
                                msg: "Bet amount cannot be negative",
                              },
                            ]);
                          }

                          if (bet > _player.balance) {
                            foundErrs = true;

                            setBetErrors([
                              ...betErrors,
                              {
                                id: _player.id,
                                msg: "Insufficient funds",
                              },
                            ]);
                          }

                          // We allow 0 bets in case the player doesnt want to bet but still wants to play

                          if (!foundErrs) {
                            setBetErrors(betErrors.filter((e) => e.id !== _player!.id));
                          }

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

                          let totalBet = bet;
                          if (state.blackjack.sideBets.perfectPairs) {
                            totalBet += bjPlayer!.sidebets.perfectPairs || 0;
                          }
                          if (state.blackjack.sideBets.twentyOnePlusThree) {
                            totalBet += bjPlayer!.sidebets.twentyOnePlusThree || 0;
                          }
                          if (state.blackjack.sideBets.betBehind) {
                            totalBet += bjPlayer!.sidebets.betBehind.bet || 0;
                          }

                          console.log(
                            `Total bet for ${_player.name} is ${totalBet} (${bet}) (balance: ${_player.balance})`
                          );
                          if (totalBet > _player.balance) {
                            setPlayerBetErrors([
                              ...playerBetErrors.filter((e) => e.id !== _player!.id),
                              {
                                id: _player.id,
                                msg: "Total bets exceeds balance",
                              },
                            ]);
                          } else {
                            setPlayerBetErrors(playerBetErrors.filter((e) => e.id !== _player!.id));
                          }
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

                            let bet = bjPlayer!.bet + 5;

                            let totalBet = bet;
                            if (state.blackjack.sideBets.perfectPairs) {
                              totalBet += bjPlayer!.sidebets.perfectPairs || 0;
                            }
                            if (state.blackjack.sideBets.twentyOnePlusThree) {
                              totalBet += bjPlayer!.sidebets.twentyOnePlusThree || 0;
                            }
                            if (state.blackjack.sideBets.betBehind) {
                              totalBet += bjPlayer!.sidebets.betBehind.bet || 0;
                            }

                            console.log(
                              `Total bet for ${_player!.name} is ${totalBet} (${bet}) (balance: ${
                                _player!.balance
                              })`
                            );
                            if (totalBet > _player!.balance) {
                              setPlayerBetErrors([
                                ...playerBetErrors.filter((e) => e.id !== _player!.id),
                                {
                                  id: _player!.id,
                                  msg: "Total bets exceeds balance",
                                },
                              ]);
                            } else {
                              setPlayerBetErrors(
                                playerBetErrors.filter((e) => e.id !== _player!.id)
                              );
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

                            let bet = bjPlayer!.bet * 2;

                            let totalBet = bet;
                            if (state.blackjack.sideBets.perfectPairs) {
                              totalBet += bjPlayer!.sidebets.perfectPairs || 0;
                            }
                            if (state.blackjack.sideBets.twentyOnePlusThree) {
                              totalBet += bjPlayer!.sidebets.twentyOnePlusThree || 0;
                            }
                            if (state.blackjack.sideBets.betBehind) {
                              totalBet += bjPlayer!.sidebets.betBehind.bet || 0;
                            }

                            console.log(
                              `Total bet for ${_player!.name} is ${totalBet} (${bet}) (balance: ${
                                _player!.balance
                              })`
                            );
                            if (totalBet > _player!.balance) {
                              setPlayerBetErrors([
                                ...playerBetErrors.filter((e) => e.id !== _player!.id),
                                {
                                  id: _player!.id,
                                  msg: "Total bets exceeds balance",
                                },
                              ]);
                            } else {
                              setPlayerBetErrors(
                                playerBetErrors.filter((e) => e.id !== _player!.id)
                              );
                            }
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

                            let bet = bjPlayer!.bet * 0.5;

                            let totalBet = bet;
                            if (state.blackjack.sideBets.perfectPairs) {
                              totalBet += bjPlayer!.sidebets.perfectPairs || 0;
                            }
                            if (state.blackjack.sideBets.twentyOnePlusThree) {
                              totalBet += bjPlayer!.sidebets.twentyOnePlusThree || 0;
                            }
                            if (state.blackjack.sideBets.betBehind) {
                              totalBet += bjPlayer!.sidebets.betBehind.bet || 0;
                            }

                            console.log(
                              `Total bet for ${_player!.name} is ${totalBet} (${bet}) (balance: ${
                                _player!.balance
                              })`
                            );
                            if (totalBet > _player!.balance) {
                              setPlayerBetErrors([
                                ...playerBetErrors.filter((e) => e.id !== _player!.id),
                                {
                                  id: _player!.id,
                                  msg: "Total bets exceeds balance",
                                },
                              ]);
                            } else {
                              setPlayerBetErrors(
                                playerBetErrors.filter((e) => e.id !== _player!.id)
                              );
                            }
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
                              bjPlayer.bet == _player!.balance ? theme.colors.dark[5] : undefined,
                          }}
                          onClick={() => {
                            modifyState({
                              blackjack: {
                                players: state.blackjack.players.map((p) => {
                                  if (bjPlayer)
                                    if (p.id === bjPlayer.id) {
                                      return {
                                        ...p,
                                        bet: _player!.balance,
                                      };
                                    }
                                  return p;
                                }),
                              },
                            });

                            let bet = _player!.balance;

                            let totalBet = bet;
                            if (state.blackjack.sideBets.perfectPairs) {
                              totalBet += bjPlayer!.sidebets.perfectPairs || 0;
                            }
                            if (state.blackjack.sideBets.twentyOnePlusThree) {
                              totalBet += bjPlayer!.sidebets.twentyOnePlusThree || 0;
                            }
                            if (state.blackjack.sideBets.betBehind) {
                              totalBet += bjPlayer!.sidebets.betBehind.bet || 0;
                            }

                            console.log(
                              `Total bet for ${_player!.name} is ${totalBet} (${bet}) (balance: ${
                                _player!.balance
                              })`
                            );
                            if (totalBet > _player!.balance) {
                              setPlayerBetErrors([
                                ...playerBetErrors.filter((e) => e.id !== _player!.id),
                                {
                                  id: _player!.id,
                                  msg: "Total bets exceeds balance",
                                },
                              ]);
                            } else {
                              setPlayerBetErrors(
                                playerBetErrors.filter((e) => e.id !== _player!.id)
                              );
                            }
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

                              setPlayerBetErrors(
                                playerBetErrors.filter((e) => e.id !== _player!.id)
                              );
                            }
                          }}
                        >
                          Remove
                        </Button>
                      </Button.Group>
                    </Grid.Col>
                  </Grid>
                  {amountOfSideBetsEnabled(state) > 0 && (
                    <>
                      <Divider my="xs" />
                      <Grid columns={amountOfSideBetsEnabled(state) * 12}>
                        {state.blackjack.sideBets.perfectPairs && (
                          <Grid.Col
                            span={
                              amountOfSideBetsEnabled(state) *
                              12 *
                              (state.blackjack.sideBets.betBehind
                                ? state.blackjack.sideBets.twentyOnePlusThree
                                  ? 0.2
                                  : 0.4
                                : 1 / amountOfSideBetsEnabled(state))
                            }
                          >
                            {" "}
                            <NumberInput
                              label="Perfect Pairs"
                              radius="md"
                              decimalScale={2}
                              fixedDecimalScale
                              thousandSeparator=","
                              leftSection={<IconCurrencyDollar />}
                              allowNegative={false}
                              error={
                                sideBetErrors.find(
                                  (e) => e.id === _player!.id && e.sideBet === "Perfect Pairs"
                                )?.msg || playerBetErrors.find((e) => e.id === _player!.id)?.msg
                              }
                              value={bjPlayer.sidebets.perfectPairs || 0}
                              onChange={(value) => {
                                if (bjPlayer == null) return;

                                checkForSideBetErrors(
                                  bjPlayer,
                                  ["Perfect Pairs"],
                                  parseFloat(`${value}`)
                                );

                                setState({
                                  ...state,
                                  blackjack: {
                                    ...state.blackjack,
                                    players: state.blackjack.players.map((p) => {
                                      if (bjPlayer)
                                        if (p.id === bjPlayer.id) {
                                          return {
                                            ...p,
                                            sidebets: {
                                              ...p.sidebets,
                                              perfectPairs: parseFloat(`${value}`),
                                            },
                                          };
                                        }

                                      return p;
                                    }),
                                  },
                                });

                                let bet = parseFloat(`${value}`);

                                let totalBet = bet + bjPlayer!.bet;

                                if (state.blackjack.sideBets.twentyOnePlusThree) {
                                  totalBet += bjPlayer!.sidebets.twentyOnePlusThree || 0;
                                }
                                if (state.blackjack.sideBets.betBehind) {
                                  totalBet += bjPlayer!.sidebets.betBehind.bet || 0;
                                }

                                console.log(
                                  `Total bet for ${
                                    _player!.name
                                  } is ${totalBet} (${bet}) (balance: ${_player!.balance})`
                                );
                                if (totalBet > _player!.balance) {
                                  setPlayerBetErrors([
                                    ...playerBetErrors.filter((e) => e.id !== _player!.id),
                                    {
                                      id: _player!.id,
                                      msg: "Total bets exceeds balance",
                                    },
                                  ]);
                                } else {
                                  setPlayerBetErrors(
                                    playerBetErrors.filter((e) => e.id !== _player!.id)
                                  );
                                }
                              }}
                            />
                          </Grid.Col>
                        )}
                        {state.blackjack.sideBets.twentyOnePlusThree && (
                          <Grid.Col
                            span={
                              amountOfSideBetsEnabled(state) *
                              12 *
                              (state.blackjack.sideBets.betBehind
                                ? state.blackjack.sideBets.perfectPairs
                                  ? 0.2
                                  : 0.4
                                : 1 / amountOfSideBetsEnabled(state))
                            }
                          >
                            {" "}
                            <NumberInput
                              label="21+3"
                              radius="md"
                              decimalScale={2}
                              fixedDecimalScale
                              thousandSeparator=","
                              leftSection={<IconCurrencyDollar />}
                              allowNegative={false}
                              error={
                                sideBetErrors.find(
                                  (e) => e.id === _player!.id && e.sideBet === "21+3"
                                )?.msg || playerBetErrors.find((e) => e.id === _player!.id)?.msg
                              }
                              value={bjPlayer.sidebets.twentyOnePlusThree || 0}
                              onChange={(value) => {
                                if (bjPlayer == null) return;

                                checkForSideBetErrors(bjPlayer, ["21+3"], parseFloat(`${value}`));

                                setState({
                                  ...state,
                                  blackjack: {
                                    ...state.blackjack,
                                    players: state.blackjack.players.map((p) => {
                                      if (bjPlayer)
                                        if (p.id === bjPlayer.id) {
                                          return {
                                            ...p,
                                            sidebets: {
                                              ...p.sidebets,
                                              twentyOnePlusThree: parseFloat(`${value}`),
                                            },
                                          };
                                        }

                                      return p;
                                    }),
                                  },
                                });

                                let bet = parseFloat(`${value}`);

                                let totalBet = bet + bjPlayer!.bet;

                                if (state.blackjack.sideBets.perfectPairs) {
                                  totalBet += bjPlayer!.sidebets.perfectPairs || 0;
                                }
                                if (state.blackjack.sideBets.betBehind) {
                                  totalBet += bjPlayer!.sidebets.betBehind.bet || 0;
                                }

                                console.log(
                                  `Total bet for ${
                                    _player!.name
                                  } is ${totalBet} (${bet}) (balance: ${_player!.balance})`
                                );
                                if (totalBet > _player!.balance) {
                                  setPlayerBetErrors([
                                    ...playerBetErrors.filter((e) => e.id !== _player!.id),
                                    {
                                      id: _player!.id,
                                      msg: "Total bets exceeds balance",
                                    },
                                  ]);
                                } else {
                                  setPlayerBetErrors(
                                    playerBetErrors.filter((e) => e.id !== _player!.id)
                                  );
                                }
                              }}
                            />
                          </Grid.Col>
                        )}
                        {state.blackjack.sideBets.betBehind && (
                          <Grid.Col
                            span={
                              amountOfSideBetsEnabled(state) *
                              12 *
                              (state.blackjack.sideBets.twentyOnePlusThree &&
                              state.blackjack.sideBets.perfectPairs
                                ? 0.6
                                : amountOfSideBetsEnabled(state) == 1
                                ? 1
                                : 0.6)
                            }
                          >
                            <Group grow>
                              <NumberInput
                                label="Bet Behind Amount"
                                radius="md"
                                decimalScale={2}
                                fixedDecimalScale
                                thousandSeparator=","
                                allowNegative={false}
                                leftSection={<IconCurrencyDollar />}
                                error={
                                  sideBetErrors.find(
                                    (e) => e.id === _player!.id && e.sideBet === "Bet Behind"
                                  )?.msg || playerBetErrors.find((e) => e.id === _player!.id)?.msg
                                }
                                value={bjPlayer.sidebets.betBehind.bet || 0}
                                onChange={(value) => {
                                  if (bjPlayer == null) return;

                                  checkForSideBetErrors(
                                    bjPlayer,
                                    ["Bet Behind"],
                                    parseFloat(`${value}`)
                                  );

                                  setState({
                                    ...state,
                                    blackjack: {
                                      ...state.blackjack,
                                      players: state.blackjack.players.map((p) => {
                                        if (bjPlayer)
                                          if (p.id === bjPlayer.id) {
                                            let bet = parseFloat(`${value}`);
                                            let target = p.sidebets.betBehind.target;
                                            if (bet == 0) {
                                              target = null;
                                            }
                                            return {
                                              ...p,
                                              sidebets: {
                                                ...p.sidebets,
                                                betBehind: {
                                                  bet,
                                                  target,
                                                },
                                              },
                                            };
                                          }

                                        return p;
                                      }),
                                    },
                                  });

                                  let bet = parseFloat(`${value}`);

                                  let totalBet = bet + bjPlayer!.bet;

                                  if (state.blackjack.sideBets.perfectPairs) {
                                    totalBet += bjPlayer!.sidebets.perfectPairs || 0;
                                  }
                                  if (state.blackjack.sideBets.twentyOnePlusThree) {
                                    totalBet += bjPlayer!.sidebets.twentyOnePlusThree || 0;
                                  }

                                  console.log(
                                    `Total bet for ${
                                      _player!.name
                                    } is ${totalBet} (${bet}) (balance: ${_player!.balance})`
                                  );
                                  if (totalBet > _player!.balance) {
                                    setPlayerBetErrors([
                                      ...playerBetErrors.filter((e) => e.id !== _player!.id),
                                      {
                                        id: _player!.id,
                                        msg: "Total bets exceeds balance",
                                      },
                                    ]);
                                  } else {
                                    setPlayerBetErrors(
                                      playerBetErrors.filter((e) => e.id !== _player!.id)
                                    );
                                  }
                                }}
                              />
                              <Select
                                label="Bet Behind Player"
                                radius="md"
                                leftSection={<IconUserSearch />}
                                leftSectionPointerEvents="none"
                                clearable
                                searchable
                                error={
                                  bjPlayer.sidebets.betBehind.bet != 0 &&
                                  !bjPlayer.sidebets.betBehind.target
                                    ? "Select a player"
                                    : undefined
                                }
                                value={bjPlayer.sidebets.betBehind.target}
                                placeholder="Select player"
                                onChange={(_, option) => {
                                  if (bjPlayer) {
                                    setState({
                                      ...state,
                                      blackjack: {
                                        ...state.blackjack,
                                        players: state.blackjack.players.map((p) => {
                                          if (bjPlayer)
                                            if (p.id === bjPlayer.id) {
                                              let bet = p.sidebets.betBehind.bet;
                                              if (!option?.value) {
                                                bet = 0;
                                              }
                                              return {
                                                ...p,
                                                sidebets: {
                                                  ...p.sidebets,
                                                  betBehind: {
                                                    bet,
                                                    target: option?.value || null,
                                                  },
                                                },
                                              };
                                            }
                                          return p;
                                        }),
                                      },
                                    });
                                  }
                                }}
                                data={state.blackjack.players
                                  .filter((p) => p.id !== bjPlayer!.id)
                                  .map((p) => ({
                                    label: getPlayer(p.id, state.players)?.name,
                                    value: p.id,
                                  }))}
                              />
                            </Group>
                          </Grid.Col>
                        )}
                      </Grid>
                    </>
                  )}
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
                  sidebets: {
                    twentyOnePlusThree: 0,
                    perfectPairs: 0,
                    betBehind: {
                      bet: 0,
                      target: null,
                    },
                  },
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

const amountOfSideBetsEnabled = (state: State) => {
  let amount = 0;
  if (state.blackjack.sideBets.perfectPairs) amount++;
  if (state.blackjack.sideBets.twentyOnePlusThree) amount++;
  if (state.blackjack.sideBets.betBehind) amount++;
  return amount;
};
