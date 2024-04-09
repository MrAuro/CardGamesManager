import {
  BLACKJACK_GAME_STATE,
  BLACKJACK_PLAYERS_STATE,
  CHIPS_STATE,
  KEYBINDINGS_STATE,
  POKER_GAME_STATE,
  SETTINGS_STATE,
} from "@/Root";
import { emitBjAction } from "@/pages/Blackjack/routes/Round";
import { emitPokerAction } from "@/pages/Poker/routes/Round";
import { CardSuit } from "@/types/Card";
import { Scope } from "@/types/Keybindings";
import { suitToIcon } from "@/utils/CardHelper";
import { formatMoney } from "@/utils/MoneyHelper";
import {
  ActionIcon,
  Badge,
  Button,
  Center,
  Divider,
  Flex,
  Grid,
  Group,
  Paper,
  ScrollArea,
  SimpleGrid,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { IconBackspaceFilled, IconMinus, IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { atom, useRecoilState, useRecoilValue } from "recoil";
import { CHIP_BREAKDOWN_AMOUNT, CHIP_BREAKDOWN_OPEN } from "./ChipBreakdown";

const CHIP_COUNT = atom<{ [key: string]: number }>({
  key: "CHIP_COUNT",
  default: {},
});

const CHIP_HISTORY = atom<{ [key: string]: number }[]>({
  key: "CHIP_TOTAL_HISTORY",
  default: [],
});

const CALCULATOR_VALUE = atom<number>({
  key: "CALCULATOR_VALUE",
  default: 0,
});

const CALCULATOR_HISTORY = atom<number[]>({
  key: "CALCULATOR_HISTORY",
  default: [],
});

export const MONOSPACE = "Fira Code, Fira Mono, Cascadia Code, monospace";

export default function TouchscreenMenu() {
  const chips = useRecoilValue(CHIPS_STATE);
  const [chipCount, setChipCount] = useRecoilState(CHIP_COUNT);
  const [chipHistory, setChipHistory] = useRecoilState(CHIP_HISTORY);
  const theme = useMantineTheme();

  const [calculatorValue, setCalculatorValue] = useRecoilState(CALCULATOR_VALUE);
  const [intitalCalculatorValue, setInitialCalculatorValue] = useState(0);
  const [calculatorHistory, setCalculatorHistory] = useRecoilState(CALCULATOR_HISTORY);

  const [, setChipBreakdownOpen] = useRecoilState(CHIP_BREAKDOWN_OPEN);
  const [, setChipBreakdownAmount] = useRecoilState(CHIP_BREAKDOWN_AMOUNT);

  const settings = useRecoilValue(SETTINGS_STATE);
  const keybindings = useRecoilValue(KEYBINDINGS_STATE);

  const blackjackGameState = useRecoilValue(BLACKJACK_GAME_STATE).gameState;
  const pokerGameState = useRecoilValue(POKER_GAME_STATE).gameState;

  const blackjackPlayers = useRecoilValue(BLACKJACK_PLAYERS_STATE);

  const [foldConfirm, setFoldConfirm] = useState(false);

  let isTJQKDistinctionNeeded = false;
  if (settings.activeTab == "Poker") {
    isTJQKDistinctionNeeded = true;
  }

  if (settings.activeTab == "Blackjack") {
    if (
      blackjackPlayers.some((player) => {
        if (
          player.sidebets.betBehind?.bet > 0 ||
          player.sidebets.perfectPairs > 0 ||
          player.sidebets.twentyOnePlusThree > 0
        ) {
          return true;
        } else {
          return false;
        }
      })
    ) {
      isTJQKDistinctionNeeded = true;
    }
  }

  useEffect(() => {
    if (Object.keys(chipCount).length !== chips.length) {
      const newChipCount: { [key: string]: number } = {};
      chips.forEach((chip) => {
        if (!chipCount[chip.color]) {
          newChipCount[chip.color] = 0;
        } else {
          newChipCount[chip.color] = chipCount[chip.color];
        }
      });
      setChipCount(newChipCount);
    }
  }, [chipCount]);

  useEffect(() => {
    if (chipHistory.length > 8) {
      setChipHistory(chipHistory.slice(1));
    }
  }, [chipHistory]);

  useEffect(() => {
    if (calculatorHistory.length > 8) {
      setCalculatorHistory(calculatorHistory.slice(1));
    }
  }, [calculatorHistory]);

  return (
    <ScrollArea m="xs" scrollbars="y" type="never">
      <Paper
        withBorder
        p="xs"
        pt={2}
        style={{
          backgroundColor: theme.colors.dark[7],
        }}
      >
        <Flex direction="row" align="center" gap="xs">
          <Text
            size="xl"
            fw={800}
            style={{
              fontFamily: "monospace",
              fontSize: "1.65rem",
            }}
          >
            {formatMoney(
              chips.reduce((acc, chip) => acc + chip.denomination * chipCount[chip.color], 0)
            )}
          </Text>
          <Flex direction="row-reverse" gap="xs">
            {chipHistory.map((_chips: { [key: string]: number }, index) => {
              let total = 0;
              for (const chip in _chips) {
                total += chips.find((c) => c.color === chip)!.denomination * _chips[chip];
              }

              return (
                <Badge
                  key={index}
                  size="lg"
                  variant="light"
                  style={{
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                  onClick={() => {
                    setChipCount(_chips);
                  }}
                >
                  {formatMoney(total)}
                </Badge>
              );
            })}
          </Flex>
        </Flex>

        <Group grow>
          <Button
            color="red"
            size="xl"
            onClick={() => {
              // Check if we have an identical chip count in history. If we don't, then add it.
              if (
                !chipHistory.find(
                  (history) => JSON.stringify(history) === JSON.stringify(chipCount)
                )
              ) {
                setChipHistory([...chipHistory, chipCount]);
              }
              setChipCount(Object.fromEntries(chips.map((chip) => [chip.color, 0])));
            }}
          >
            Clear
          </Button>
          <Button
            color="blue"
            size="xl"
            p="xs"
            style={{
              fontSize: "1rem",
            }}
            onClick={() => {
              let total = chips.reduce(
                (acc, chip) => acc + chip.denomination * chipCount[chip.color],
                0
              );
              // todo
              // if (!chipHistory.includes(chipCount)) setChipHistory([...chipHistory, chipCount]);
              setCalculatorValue(total);
              setInitialCalculatorValue(total);
            }}
          >
            Move to Calculator
          </Button>
          <Button
            color="green"
            size="xl"
            p="xs"
            onClick={() => {
              let total = chips.reduce(
                (acc, chip) => acc + chip.denomination * chipCount[chip.color],
                0
              );
              setChipHistory([...chipHistory, chipCount]);
              setChipCount(Object.fromEntries(chips.map((chip) => [chip.color, 0])));

              if (settings.activeTab == "Poker" && pokerGameState != "PREROUND") {
                emitPokerAction(total);
              } else if (settings.activeTab == "Blackjack" && blackjackGameState == "ROUND") {
                emitBjAction(total);
              }
            }}
          >
            Bet
          </Button>
        </Group>
        <Divider my="xs" />
        <SimpleGrid cols={3} spacing="xs">
          {chips.map((chip) => {
            return (
              <Paper
                key={chip.color}
                p={5}
                style={{
                  backgroundColor: chip.color,
                }}
              >
                <Center>
                  <Button
                    size="xs"
                    color={chip.color}
                    autoContrast
                    style={{
                      fontFamily: MONOSPACE,
                      opacity: 0.5,
                    }}
                    onClick={() => {
                      setChipCount({
                        ...chipCount,
                        [chip.color]: chipCount[chip.color] + 20,
                      });
                    }}
                  >
                    {formatMoney(chip.denomination, false, true)} (
                    {formatMoney(chip.denomination * 20, false, true)})
                  </Button>
                </Center>
                <Center>
                  <Button
                    color={chip.color}
                    autoContrast
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 600,
                      fontFamily: MONOSPACE,
                      opacity: chipCount[chip.color] === 0 ? 0.5 : 1,
                    }}
                    onClick={() => {
                      setChipCount({
                        ...chipCount,
                        [chip.color]: chipCount[chip.color] + 5,
                      });
                    }}
                  >
                    {formatMoney(chip.denomination * chipCount[chip.color])}
                  </Button>
                </Center>
                <Flex direction="row" align="center" justify="center">
                  <SimpleGrid cols={3} spacing="xs">
                    <ActionIcon
                      size="xl"
                      color={chip.color}
                      autoContrast
                      style={{
                        opacity: 0.5,
                      }}
                      onClick={() => {
                        setChipCount({
                          ...chipCount,
                          [chip.color]: chipCount[chip.color] + 1,
                        });
                      }}
                    >
                      <IconPlus strokeWidth={4} />
                    </ActionIcon>
                    <ActionIcon
                      color={chip.color}
                      autoContrast
                      variant="filled"
                      size="xl"
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 500,
                        fontFamily: MONOSPACE,
                        opacity: chipCount[chip.color] === 0 ? 0.5 : 1,
                      }}
                      onClick={() => {
                        setChipCount({
                          ...chipCount,
                          [chip.color]: 0,
                        });
                      }}
                    >
                      {chipCount[chip.color]}
                    </ActionIcon>
                    <ActionIcon
                      size="xl"
                      color={chip.color}
                      autoContrast
                      style={{
                        opacity: 0.5,
                      }}
                      onClick={() => {
                        setChipCount({
                          ...chipCount,
                          [chip.color]: Math.max(chipCount[chip.color] - 1, 0),
                        });
                      }}
                    >
                      <IconMinus strokeWidth={4} />
                    </ActionIcon>
                  </SimpleGrid>
                </Flex>
              </Paper>
            );
          })}
        </SimpleGrid>
      </Paper>
      <Paper
        mt="xs"
        withBorder
        p="xs"
        pt={2}
        style={{
          backgroundColor: theme.colors.dark[7],
        }}
      >
        <Flex direction="row" align="center" gap="xs">
          <Text
            size="xl"
            fw={800}
            style={{
              fontFamily: "monospace",
              fontSize: "1.65rem",
              cursor: "pointer",
            }}
            onClick={() => {
              setChipBreakdownOpen(true);
              setChipBreakdownAmount(calculatorValue);
            }}
          >
            {formatMoney(calculatorValue)}
          </Text>
          <Flex direction="row-reverse" gap="xs">
            {calculatorHistory.map((total, index) => {
              return (
                <Badge
                  key={index}
                  size="lg"
                  variant="light"
                  style={{
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                  onClick={() => {
                    setCalculatorValue(total);
                  }}
                >
                  {formatMoney(total)}
                </Badge>
              );
            })}
          </Flex>
        </Flex>
        <SimpleGrid cols={4}>
          <Button
            size="xl"
            onClick={() => {
              if (calculatorValue === 0) {
                let total = chips.reduce(
                  (acc, chip) => acc + chip.denomination * chipCount[chip.color],
                  0
                );
                setInitialCalculatorValue(total);
                setCalculatorValue(total * 2);
              } else {
                setCalculatorValue(calculatorValue * 2);
              }
            }}
          >
            X2
          </Button>
          <Button
            size="xl"
            onClick={() => {
              if (calculatorValue === 0) {
                let total = chips.reduce(
                  (acc, chip) => acc + chip.denomination * chipCount[chip.color],
                  0
                );
                setInitialCalculatorValue(total);
                setCalculatorValue(total * 1.5);
              } else {
                setCalculatorValue(calculatorValue * 1.5);
              }
            }}
          >
            X1.5
          </Button>

          <Button
            size="xl"
            onClick={() => {
              if (calculatorValue === 0) {
                let total = chips.reduce(
                  (acc, chip) => acc + chip.denomination * chipCount[chip.color],
                  0
                );
                setInitialCalculatorValue(total);
                setCalculatorValue(total / 2);
              } else {
                setCalculatorValue(calculatorValue / 2);
              }
            }}
          >
            1/2
          </Button>
          <Button
            size="xl"
            color="green"
            onClick={() => {
              if (settings.activeTab == "Poker" && pokerGameState != "PREROUND") {
                emitPokerAction(calculatorValue);
              } else if (settings.activeTab == "Blackjack" && blackjackGameState == "ROUND") {
                emitBjAction(calculatorValue);
              }
            }}
          >
            Bet
          </Button>
          <Button
            size="xl"
            p={0}
            disabled={intitalCalculatorValue == 0}
            onClick={() => {
              setCalculatorValue(calculatorValue + intitalCalculatorValue);
            }}
          >
            +{formatMoney(intitalCalculatorValue)}
          </Button>
          <Button
            size="xl"
            p={0}
            disabled={intitalCalculatorValue == 0}
            onClick={() => {
              setCalculatorValue(calculatorValue - intitalCalculatorValue);
            }}
          >
            -{formatMoney(intitalCalculatorValue)}
          </Button>
          <Button
            size="xl"
            color="grape"
            disabled={calculatorValue === intitalCalculatorValue || intitalCalculatorValue === 0}
            p={0}
            onClick={() => setCalculatorValue(intitalCalculatorValue)}
          >
            Reset
          </Button>
          <Button
            size="xl"
            color="red"
            disabled={calculatorValue === 0}
            p={0}
            onClick={() => {
              setCalculatorHistory([...calculatorHistory, calculatorValue]);
              setCalculatorValue(0);
              setInitialCalculatorValue(0);
            }}
          >
            Clear
          </Button>
        </SimpleGrid>
      </Paper>
      <Paper
        withBorder
        p="xs"
        mt="xs"
        style={{
          backgroundColor: theme.colors.dark[7],
        }}
      >
        <Grid columns={9} grow gutter="xs">
          {["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"]
            .filter((suit) => {
              if (!isTJQKDistinctionNeeded && ["J", "Q", "K"].includes(suit)) {
                return false;
              } else {
                return true;
              }
            })
            .map((rank) => {
              return (
                <Grid.Col
                  span={
                    !isTJQKDistinctionNeeded
                      ? rank == "T"
                        ? 9
                        : 3
                      : ["A", "2", "3", "4", "5", "6", "7", "8", "9"].includes(rank)
                      ? 3
                      : 2
                  }
                >
                  <Button
                    size="xl"
                    p="xs"
                    color="gray"
                    fullWidth
                    style={{
                      fontSize: "1.75rem",
                      fontWeight: 700,
                    }}
                    onClick={() => {
                      // This is hacky, but it works
                      // We emulate a keydown event to trigger the keybinding, rather than adding a ton of
                      // additional logic to multiple components

                      let targetScope: Scope = "None";
                      if (settings.activeTab == "Poker" && pokerGameState != "PREROUND") {
                        targetScope = "Poker Round";
                      } else if (
                        settings.activeTab == "Blackjack" &&
                        blackjackGameState == "ROUND"
                      ) {
                        targetScope = "Blackjack Round";
                      }
                      let keybinding = keybindings.find((keybinding) => {
                        if (
                          keybinding.action == rank &&
                          keybinding.scope == targetScope &&
                          keybinding.selector == "None"
                        ) {
                          return true;
                        } else {
                          return false;
                        }
                      });

                      if (keybinding) {
                        document.dispatchEvent(
                          new KeyboardEvent("keydown", { key: keybinding.key })
                        );
                      } else {
                        alert(
                          `Missing keybinding for scope: "${targetScope}" and action: "${rank}" and selector: "None". Add before using this button.`
                        );
                      }
                    }}
                  >
                    {rank}
                  </Button>
                </Grid.Col>
              );
            })}
        </Grid>
        <Divider my="xs" />
        <Grid columns={5} grow>
          {["h", "s", "d", "c"].map((suit) => {
            let color: "red" | "dark" | "blue" | "green" =
              suit == "h" || suit == "d" ? "red" : "dark";
            if (settings.fourColorDeck) {
              if (suit == "d") {
                color = "blue";
              } else if (suit == "c") {
                color = "green";
              }
            }

            return (
              <Grid.Col span={1}>
                <Button
                  size="xl"
                  p="xs"
                  color={color}
                  fullWidth
                  onClick={() => {
                    // This is hacky, but it works
                    // We emulate a keydown event to trigger the keybinding, rather than adding a ton of
                    // additional logic to multiple components

                    let targetScope: Scope = "None";
                    if (settings.activeTab == "Poker" && pokerGameState != "PREROUND") {
                      targetScope = "Poker Round";
                    } else if (settings.activeTab == "Blackjack" && blackjackGameState == "ROUND") {
                      targetScope = "Blackjack Round";
                    }
                    let keybinding = keybindings.find((keybinding) => {
                      if (
                        keybinding.action == suit &&
                        keybinding.scope == targetScope &&
                        keybinding.selector == "None"
                      ) {
                        return true;
                      } else {
                        return false;
                      }
                    });

                    if (keybinding) {
                      document.dispatchEvent(new KeyboardEvent("keydown", { key: keybinding.key }));
                    } else {
                      alert(
                        `Missing keybinding for scope: "${targetScope}" and action: "${suit}" and selector: "None". Add before using this button.`
                      );
                    }
                  }}
                >
                  {suitToIcon(suit as CardSuit)}
                </Button>
              </Grid.Col>
            );
          })}
          <Grid.Col span={1}>
            <Button
              size="xl"
              p="xs"
              color="white"
              autoContrast
              fullWidth
              onClick={() => {
                // This is hacky, but it works
                // We emulate a keydown event to trigger the keybinding, rather than adding a ton of
                // additional logic to multiple components

                let targetScope: Scope = "None";
                if (settings.activeTab == "Poker" && pokerGameState != "PREROUND") {
                  targetScope = "Poker Round";
                } else if (settings.activeTab == "Blackjack" && blackjackGameState == "ROUND") {
                  targetScope = "Blackjack Round";
                } else {
                  alert("Current tab does not support this action.");
                  return;
                }
                let keybinding = keybindings.find((keybinding) => {
                  if (
                    keybinding.action == "Remove Last Card" &&
                    keybinding.scope == targetScope &&
                    keybinding.selector == "None"
                  ) {
                    return true;
                  } else {
                    return false;
                  }
                });

                if (keybinding) {
                  document.dispatchEvent(new KeyboardEvent("keydown", { key: keybinding.key }));
                } else {
                  alert(
                    `Missing keybinding for scope: "${targetScope}" and action: "Remove Last Card" and selector: "None". Add before using this button.`
                  );
                }
              }}
            >
              <IconBackspaceFilled size="2rem" />
            </Button>
          </Grid.Col>
        </Grid>
      </Paper>
      {settings.activeTab == "Poker" && (
        <Paper
          withBorder
          p="xs"
          mt="xs"
          style={{
            backgroundColor: theme.colors.dark[7],
          }}
        >
          <Group grow>
            <Button
              size="xl"
              color="green"
              onClick={() => {
                emitPokerAction("check");
              }}
            >
              Check
            </Button>
            <Button
              size="xl"
              color="blue"
              onClick={() => {
                emitPokerAction("call");
              }}
            >
              Call
            </Button>
            <Button
              size="xl"
              color="red"
              onClick={() => {
                if (foldConfirm) {
                  emitPokerAction("fold");
                } else {
                  setFoldConfirm(true);
                  setTimeout(() => {
                    setFoldConfirm(false);
                  }, 5000);
                }
              }}
            >
              {foldConfirm ? "Really?" : "Fold"}
            </Button>
          </Group>
        </Paper>
      )}
      {settings.activeTab == "Blackjack" && (
        <Paper
          withBorder
          p="xs"
          mt="xs"
          style={{
            backgroundColor: theme.colors.dark[7],
          }}
        >
          <Group grow>
            <Button
              size="xl"
              color="green"
              onClick={() => {
                emitBjAction("stand");
              }}
            >
              Stand
            </Button>
            <Button
              size="xl"
              color="red"
              onClick={() => {
                emitBjAction("double");
              }}
            >
              Double
            </Button>
            <Button
              size="xl"
              color="grape"
              onClick={() => {
                emitBjAction("split");
              }}
            >
              Split
            </Button>
          </Group>
          <Group grow mt="sm">
            <Button
              size="xl"
              color="red"
              variant="light"
              onClick={() => {
                emitBjAction("forcebust");
              }}
            >
              Bust
            </Button>
            <Button
              size="xl"
              color="yellow"
              variant="light"
              onClick={() => {
                emitBjAction("forceblackjack");
              }}
            >
              Blackjack
            </Button>
          </Group>
        </Paper>
      )}
    </ScrollArea>
  );
}
