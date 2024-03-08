import { BLACKJACK_GAME_STATE, BLACKJACK_PLAYERS_STATE, BLACKJACK_SETTINGS } from "@/Root";
import PlayerSelector from "@/components/PlayerSelector";
import { getPlayerErrors } from "@/utils/BlackjackHelper";
import { EMPTY_CARD } from "@/utils/CardHelper";
import { formatMoney } from "@/utils/MoneyHelper";
import { useRecoilImmerState } from "@/utils/RecoilImmer";
import { Draggable, DraggableStateSnapshot } from "@hello-pangea/dnd";
import {
  Alert,
  Button,
  ButtonGroup,
  Card,
  CloseButton,
  Collapse,
  Combobox,
  Divider,
  Group,
  NumberInput,
  Select,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import {
  IconChevronsDown,
  IconCurrencyDollar,
  IconInfoTriangle,
  IconUserSearch,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import { useRecoilState } from "recoil";

function getStyle(style: any, snapshot: DraggableStateSnapshot) {
  if (!snapshot.isDropAnimating) {
    return style;
  }
  const { curve, duration } = snapshot.dropAnimation!;

  return {
    ...style,
    opacity: snapshot.isDragging && !snapshot.isDropAnimating ? 0.65 : 1,
    transition: `all ${curve} ${duration + 500}ms`,
  };
}

export default function PreRound() {
  const theme = useMantineTheme();
  const [blackjackSettings] = useRecoilState(BLACKJACK_SETTINGS);
  const [blackjackPlayers, setBlackjackPlayers] = useRecoilImmerState(BLACKJACK_PLAYERS_STATE);
  const [blackjackGame, setBlackjackGame] = useRecoilState(BLACKJACK_GAME_STATE);

  const [sidebetsOpen, setSidebetsOpen] = useState<string[]>([]);
  const [gameErrors, setGameErrors] = useState<string[]>([]);

  const startGame = () => {
    let tempGameErrors = [];
    if (blackjackPlayers.length < 1) {
      tempGameErrors.push("At least one player is required");
    }

    if (blackjackPlayers.some((player) => player.errors.length > 0)) {
      tempGameErrors.push("Invalid bets");
    }

    setGameErrors(tempGameErrors);
    if (tempGameErrors.length > 0) return;

    setBlackjackGame({
      ...blackjackGame,
      currentTurn: "DEALER",
      gameState: "ROUND",
      dealerCards: [EMPTY_CARD, EMPTY_CARD],
      dealerFirstTime: true,
    });

    setBlackjackPlayers((draft) => {
      draft.forEach((player) => {
        player.cards = [];
        player.doubledDown = false;
        player.split = false;
        player.splitFrom = undefined;
      });
    });
  };

  return (
    <>
      {gameErrors.length > 0 && (
        <Alert color="red" title="Game Errors" icon={<IconInfoTriangle />}>
          {gameErrors.map((error) => (
            <Text key={error}>{error}</Text>
          ))}
        </Alert>
      )}
      {blackjackPlayers.some((player) => player.errors.length > 0) && (
        <Alert color="red" title="Invalid bets" icon={<IconInfoTriangle />}>
          {blackjackPlayers
            .filter((player) => player.errors.length > 0)
            .map((player) => {
              return (
                <Text key={player.id}>
                  <b>{player.displayName}</b>: {player.errors.join(", ")}
                </Text>
              );
            })}
        </Alert>
      )}
      <Button
        fullWidth
        mt="sm"
        disabled={blackjackPlayers.some((player) => player.errors.length > 0)}
        onClick={startGame}
      >
        Start Game
      </Button>
      <Divider my="md" />
      <Title order={2} mb="sm">
        Players
      </Title>
      <PlayerSelector
        game="BLACKJACK"
        playerElement={(index, player, blackjackPlayer) => {
          if (!blackjackPlayer) return <></>;

          return (
            <Draggable key={player.id} index={index} draggableId={player.id}>
              {(provided, snapshot) => (
                <div
                  key={player.id}
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={{
                    ...getStyle(provided.draggableProps.style, snapshot),
                    isDragging: snapshot.isDragging && !snapshot.isDropAnimating,
                    marginBottom: theme.spacing.sm,
                    opacity: snapshot.isDragging && !snapshot.isDropAnimating ? 0.65 : 1,
                  }}
                >
                  <Card withBorder radius="md" p="sm" key={player.id}>
                    <Group justify="space-between">
                      <div>
                        <Text size="lg" fw="bold">
                          {player.name}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {formatMoney(player.balance)}
                        </Text>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          width: "80%",
                        }}
                      >
                        <NumberInput
                          radius="md"
                          mx="sm"
                          decimalScale={2}
                          fixedDecimalScale
                          thousandSeparator=","
                          value={blackjackPlayer.bet}
                          error={blackjackPlayer.errors.length > 0}
                          leftSection={<IconCurrencyDollar />}
                          onChange={(value) => {
                            setBlackjackPlayers((draft) => {
                              draft[index].bet = Math.floor(parseFloat(`${value}`) * 100) / 100;

                              draft[index].errors = getPlayerErrors(
                                player.balance,
                                blackjackSettings,
                                {
                                  bet: draft[index].bet,
                                  twentyOnePlusThree: draft[index].sidebets.twentyOnePlusThree,
                                  perfectPairs: draft[index].sidebets.perfectPairs,
                                  betBehindBet: draft[index].sidebets.betBehind.bet,
                                  betBehindTarget: draft[index].sidebets.betBehind.target,
                                }
                              );
                            });
                          }}
                        />
                        <ButtonGroup
                          style={{
                            width: "100%",
                          }}
                        >
                          <Button
                            fullWidth
                            variant="light"
                            disabled={blackjackPlayer.bet + 5 > player.balance}
                            onClick={() => {
                              setBlackjackPlayers((draft) => {
                                draft[index].bet = Math.floor((draft[index].bet + 5) * 100) / 100;

                                draft[index].errors = getPlayerErrors(
                                  player.balance,
                                  blackjackSettings,
                                  {
                                    bet: draft[index].bet,
                                    twentyOnePlusThree: draft[index].sidebets.twentyOnePlusThree,
                                    perfectPairs: draft[index].sidebets.perfectPairs,
                                    betBehindBet: draft[index].sidebets.betBehind.bet,
                                    betBehindTarget: draft[index].sidebets.betBehind.target,
                                  }
                                );
                              });
                            }}
                            style={{
                              backgroundColor:
                                blackjackPlayer.bet + 5 > player.balance
                                  ? theme.colors.dark[5]
                                  : undefined,
                            }}
                          >
                            +5
                          </Button>
                          <Button
                            fullWidth
                            variant="light"
                            disabled={blackjackPlayer.bet * 2 > player.balance}
                            onClick={() => {
                              setBlackjackPlayers((draft) => {
                                draft[index].bet = Math.floor(draft[index].bet * 2 * 100) / 100;

                                draft[index].errors = getPlayerErrors(
                                  player.balance,
                                  blackjackSettings,
                                  {
                                    bet: draft[index].bet,
                                    twentyOnePlusThree: draft[index].sidebets.twentyOnePlusThree,
                                    perfectPairs: draft[index].sidebets.perfectPairs,
                                    betBehindBet: draft[index].sidebets.betBehind.bet,
                                    betBehindTarget: draft[index].sidebets.betBehind.target,
                                  }
                                );
                              });
                            }}
                            style={{
                              backgroundColor:
                                blackjackPlayer.bet * 2 > player.balance
                                  ? theme.colors.dark[5]
                                  : undefined,
                            }}
                          >
                            X2
                          </Button>
                          <Button
                            fullWidth
                            variant="light"
                            disabled={Math.floor((blackjackPlayer.bet * 100) / 2) == 0}
                            onClick={() => {
                              setBlackjackPlayers((draft) => {
                                draft[index].bet = Math.floor((draft[index].bet / 2) * 100) / 100;

                                draft[index].errors = getPlayerErrors(
                                  player.balance,
                                  blackjackSettings,
                                  {
                                    bet: draft[index].bet,
                                    twentyOnePlusThree: draft[index].sidebets.twentyOnePlusThree,
                                    perfectPairs: draft[index].sidebets.perfectPairs,
                                    betBehindBet: draft[index].sidebets.betBehind.bet,
                                    betBehindTarget: draft[index].sidebets.betBehind.target,
                                  }
                                );
                              });
                            }}
                            style={{
                              backgroundColor:
                                Math.floor((blackjackPlayer.bet * 100) / 2) == 0
                                  ? theme.colors.dark[5]
                                  : undefined,
                            }}
                          >
                            1/2
                          </Button>
                          <Button
                            fullWidth
                            variant="light"
                            disabled={blackjackPlayer.bet == player.balance}
                            onClick={() => {
                              setBlackjackPlayers((draft) => {
                                draft[index].bet = Math.floor(player.balance * 100) / 100;

                                draft[index].errors = getPlayerErrors(
                                  player.balance,
                                  blackjackSettings,
                                  {
                                    bet: draft[index].bet,
                                    twentyOnePlusThree: draft[index].sidebets.twentyOnePlusThree,
                                    perfectPairs: draft[index].sidebets.perfectPairs,
                                    betBehindBet: draft[index].sidebets.betBehind.bet,
                                    betBehindTarget: draft[index].sidebets.betBehind.target,
                                  }
                                );
                              });
                            }}
                            style={{
                              backgroundColor:
                                blackjackPlayer.bet == player.balance
                                  ? theme.colors.dark[5]
                                  : undefined,
                            }}
                          >
                            Max
                          </Button>
                          {(blackjackSettings.betBehindEnabled ||
                            blackjackSettings.perfectPairsEnabled ||
                            blackjackSettings.twentyOnePlusThreeEnabled) && (
                            <Button
                              fullWidth
                              variant="light"
                              onClick={() => {
                                if (sidebetsOpen.includes(player.id)) {
                                  setSidebetsOpen(sidebetsOpen.filter((id) => id !== player.id));
                                } else {
                                  setSidebetsOpen([...sidebetsOpen, player.id]);
                                }
                              }}
                              color="green"
                            >
                              {sidebetsOpen.includes(player.id) ? (
                                <IconChevronsDown
                                  size="1.25rem"
                                  style={{
                                    transform: "rotate(180deg)",
                                    transition: "transform 0.3s ease",
                                  }}
                                />
                              ) : (
                                <IconChevronsDown
                                  size="1.25rem"
                                  style={{
                                    transform: "rotate(0deg)",
                                    transition: "transform 0.3s ease",
                                  }}
                                />
                              )}
                            </Button>
                          )}
                          <Button
                            fullWidth
                            variant="light"
                            color="red"
                            onClick={() => {
                              setBlackjackPlayers((draft) => {
                                draft.splice(index, 1);
                              });
                            }}
                          >
                            <IconX size="1.25rem" />
                          </Button>
                        </ButtonGroup>
                      </div>
                    </Group>
                    <Collapse
                      in={sidebetsOpen.includes(player.id) || blackjackPlayer.errors.length > 0}
                    >
                      <Divider mt={5} mb={5} />
                      <Group grow preventGrowOverflow={false} wrap="nowrap">
                        {blackjackSettings.perfectPairsEnabled && (
                          <Group grow>
                            <NumberInput
                              label="Perfect Pairs"
                              radius="md"
                              decimalScale={2}
                              fixedDecimalScale
                              thousandSeparator=","
                              placeholder="0.00"
                              leftSection={<IconCurrencyDollar />}
                              allowNegative={false}
                              value={blackjackPlayer.sidebets.perfectPairs}
                              error={blackjackPlayer.errors.length > 0}
                              onChange={(value) => {
                                setBlackjackPlayers((draft) => {
                                  draft[index].sidebets.perfectPairs =
                                    Math.floor(parseFloat(`${value}`) * 100) / 100;

                                  draft[index].errors = getPlayerErrors(
                                    player.balance,
                                    blackjackSettings,
                                    {
                                      bet: draft[index].bet,
                                      twentyOnePlusThree: draft[index].sidebets.twentyOnePlusThree,
                                      perfectPairs: draft[index].sidebets.perfectPairs,
                                      betBehindBet: draft[index].sidebets.betBehind.bet,
                                      betBehindTarget: draft[index].sidebets.betBehind.target,
                                    }
                                  );
                                });
                              }}
                            />
                          </Group>
                        )}
                        {blackjackSettings.twentyOnePlusThreeEnabled && (
                          <Group grow>
                            <NumberInput
                              label="21+3"
                              radius="md"
                              decimalScale={2}
                              fixedDecimalScale
                              thousandSeparator=","
                              placeholder="0.00"
                              leftSection={<IconCurrencyDollar />}
                              allowNegative={false}
                              value={blackjackPlayer.sidebets.twentyOnePlusThree}
                              error={blackjackPlayer.errors.length > 0}
                              onChange={(value) => {
                                setBlackjackPlayers((draft) => {
                                  draft[index].sidebets.twentyOnePlusThree =
                                    Math.floor(parseFloat(`${value}`) * 100) / 100;

                                  draft[index].errors = getPlayerErrors(
                                    player.balance,
                                    blackjackSettings,
                                    {
                                      bet: draft[index].bet,
                                      twentyOnePlusThree: draft[index].sidebets.twentyOnePlusThree,
                                      perfectPairs: draft[index].sidebets.perfectPairs,
                                      betBehindBet: draft[index].sidebets.betBehind.bet,
                                      betBehindTarget: draft[index].sidebets.betBehind.target,
                                    }
                                  );
                                });
                              }}
                            />
                          </Group>
                        )}
                        {blackjackSettings.betBehindEnabled && (
                          <Group grow>
                            <Group>
                              <NumberInput
                                label="Bet Behind Amount"
                                radius="md"
                                decimalScale={2}
                                fixedDecimalScale
                                thousandSeparator=","
                                placeholder="0.00"
                                leftSection={<IconCurrencyDollar />}
                                allowNegative={false}
                                value={blackjackPlayer.sidebets.betBehind.bet}
                                error={blackjackPlayer.errors.length > 0}
                                onChange={(value) => {
                                  setBlackjackPlayers((draft) => {
                                    draft[index].sidebets.betBehind.bet =
                                      Math.floor(parseFloat(`${value}`) * 100) / 100;

                                    draft[index].errors = getPlayerErrors(
                                      player.balance,
                                      blackjackSettings,
                                      {
                                        bet: draft[index].bet,
                                        twentyOnePlusThree:
                                          draft[index].sidebets.twentyOnePlusThree,
                                        perfectPairs: draft[index].sidebets.perfectPairs,
                                        betBehindBet: draft[index].sidebets.betBehind.bet,
                                        betBehindTarget: draft[index].sidebets.betBehind.target,
                                      }
                                    );
                                  });
                                }}
                              />
                            </Group>
                            <Select
                              label="Bet Behind Player"
                              radius="md"
                              leftSection={<IconUserSearch />}
                              leftSectionPointerEvents="none"
                              searchable
                              placeholder="Select Player"
                              value={blackjackPlayer.sidebets.betBehind.target || null}
                              data={blackjackPlayers
                                .filter((p) => p.id !== player.id)
                                .map((p) => ({ label: p.displayName, value: p.id }))}
                              error={blackjackPlayer.errors.length > 0}
                              onChange={(value) => {
                                if (value === null) {
                                  setBlackjackPlayers((draft) => {
                                    draft[index].sidebets.betBehind.bet = 0;
                                    draft[index].sidebets.betBehind.target = "";

                                    draft[index].errors = getPlayerErrors(
                                      player.balance,
                                      blackjackSettings,
                                      {
                                        bet: draft[index].bet,
                                        twentyOnePlusThree:
                                          draft[index].sidebets.twentyOnePlusThree,
                                        perfectPairs: draft[index].sidebets.perfectPairs,
                                        betBehindBet: draft[index].sidebets.betBehind.bet,
                                        betBehindTarget: draft[index].sidebets.betBehind.target,
                                      }
                                    );
                                  });
                                } else {
                                  setBlackjackPlayers((draft) => {
                                    draft[index].sidebets.betBehind.target = value;

                                    draft[index].errors = getPlayerErrors(
                                      player.balance,
                                      blackjackSettings,
                                      {
                                        bet: draft[index].bet,
                                        twentyOnePlusThree:
                                          draft[index].sidebets.twentyOnePlusThree,
                                        perfectPairs: draft[index].sidebets.perfectPairs,
                                        betBehindBet: draft[index].sidebets.betBehind.bet,
                                        betBehindTarget: draft[index].sidebets.betBehind.target,
                                      }
                                    );
                                  });
                                }
                              }}
                              rightSection={
                                blackjackPlayer.sidebets.betBehind.target ? (
                                  <CloseButton
                                    size="sm"
                                    onClick={() => {
                                      setBlackjackPlayers((draft) => {
                                        draft[index].sidebets.betBehind.bet = 0;
                                        draft[index].sidebets.betBehind.target = "";

                                        draft[index].errors = getPlayerErrors(
                                          player.balance,
                                          blackjackSettings,
                                          {
                                            bet: draft[index].bet,
                                            twentyOnePlusThree:
                                              draft[index].sidebets.twentyOnePlusThree,
                                            perfectPairs: draft[index].sidebets.perfectPairs,
                                            betBehindBet: draft[index].sidebets.betBehind.bet,
                                            betBehindTarget: draft[index].sidebets.betBehind.target,
                                          }
                                        );
                                      });
                                    }}
                                  />
                                ) : (
                                  <Combobox.Chevron />
                                )
                              }
                              rightSectionPointerEvents={
                                blackjackPlayer.sidebets.betBehind.target?.length ? "auto" : "none"
                              }
                            />
                          </Group>
                        )}
                      </Group>
                    </Collapse>
                  </Card>
                </div>
              )}
            </Draggable>
          );
        }}
      />
    </>
  );
}
