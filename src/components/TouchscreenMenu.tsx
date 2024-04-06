import {
  BLACKJACK_GAME_STATE,
  CHIPS_STATE,
  KEYBINDINGS_STATE,
  POKER_GAME_STATE,
  SETTINGS_STATE,
} from "@/Root";
import { CardRank, CardSuit } from "@/types/Card";
import { Scope } from "@/types/Keybindings";
import { Chip } from "@/types/Settings";
import { suitToIcon } from "@/utils/CardHelper";
import { formatMoney } from "@/utils/MoneyHelper";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Center,
  ColorSwatch,
  Divider,
  Flex,
  Grid,
  Group,
  Modal,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  darken,
  lighten,
  useMantineTheme,
} from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { atom, useRecoilState, useRecoilValue } from "recoil";

const CHIP_COUNT = atom<{ [key: string]: number }>({
  key: "CHIP_COUNT",
  default: {},
});

const CHIP_TOTAL_HISTORY = atom<number[]>({
  key: "CHIP_TOTAL_HISTORY",
  default: [],
});

const CALCULATOR_HISTORY = atom<number[]>({
  key: "CALCULATOR_HISTORY",
  default: [],
});

const MONOSPACE = "Fira Code, Fira Mono, Cascadia Code, monospace";

export default function TouchscreenMenu() {
  const chips = useRecoilValue(CHIPS_STATE);
  const [chipCount, setChipCount] = useRecoilState(CHIP_COUNT);
  const [chipTotalHistory, setChipTotalHistory] = useRecoilState(CHIP_TOTAL_HISTORY);
  const theme = useMantineTheme();

  const [calculatorValue, setCalculatorValue] = useState(0);
  const [intitalCalculatorValue, setInitialCalculatorValue] = useState(0);
  const [calculatorHistory, setCalculatorHistory] = useRecoilState(CALCULATOR_HISTORY);

  const [chipChecked, setChipChecked] = useState<{ [key: string]: boolean }>({});

  const [chipBreakdownOpen, setChipBreakdownOpen] = useState(false);
  const [chipBreakdown, setChipBreakdown] = useState<{ [key: string]: number }>({});

  const settings = useRecoilValue(SETTINGS_STATE);
  const keybindings = useRecoilValue(KEYBINDINGS_STATE);

  const blackjackGameState = useRecoilValue(BLACKJACK_GAME_STATE).gameState;
  const pokerGameState = useRecoilValue(POKER_GAME_STATE).gameState;

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
    if (Object.keys(chipChecked).length !== chips.length) {
      const newChipChecked: { [key: string]: boolean } = {};
      chips.forEach((chip) => {
        if (!chipChecked[chip.color]) {
          newChipChecked[chip.color] = true;
        } else {
          newChipChecked[chip.color] = chipChecked[chip.color];
        }
      });
      setChipChecked(newChipChecked);
    }
  }, [chipChecked]);

  useEffect(() => {
    setChipBreakdown(
      getChipBreakdown(
        chips.filter((chip) => chipChecked[chip.color]),
        calculatorValue
      )
    );
  }, [chipChecked, chipBreakdownOpen]);

  useEffect(() => {
    if (chipTotalHistory.length > 5) {
      setChipTotalHistory(chipTotalHistory.slice(1));
    }
  }, [chipTotalHistory]);

  useEffect(() => {
    if (calculatorHistory.length > 5) {
      setCalculatorHistory(calculatorHistory.slice(1));
    }
  }, [calculatorHistory]);

  return (
    <ScrollArea m="xs" scrollbars="y" type="never">
      <Modal
        title="Chip Breakdown"
        opened={chipBreakdownOpen}
        onClose={() => setChipBreakdownOpen(false)}
      >
        <>
          <Stack>
            {chips.map((chip) => {
              return (
                <Flex direction="row" gap="xs" align="center">
                  <ColorSwatch
                    color={chip.color}
                    component="button"
                    size={50}
                    style={{
                      opacity: chipChecked[chip.color] ? 1 : 0.1,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setChipChecked({
                        ...chipChecked,
                        [chip.color]: !chipChecked[chip.color],
                      });
                    }}
                  >
                    <Badge
                      autoContrast
                      color={chip.color}
                      p={0}
                      size="xl"
                      td={chipChecked[chip.color] ? undefined : "line-through"}
                    >
                      {formatMoney(chip.denomination, true, true)}
                    </Badge>
                  </ColorSwatch>
                  <Text size="xl" style={{ fontFamily: MONOSPACE }}>
                    {chipBreakdown[chip.color] || ""}
                  </Text>
                </Flex>
              );
            })}
            {chipBreakdown["Remaining"] ? (
              <Text>
                Could not break down remaining {formatMoney(chipBreakdown["Remaining"], true, true)}
              </Text>
            ) : null}
          </Stack>
        </>
      </Modal>
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
            {chipTotalHistory.map((total, index) => {
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
                    setChipTotalHistory(chipTotalHistory.filter((_, i) => i !== index));
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
              let total = chips.reduce(
                (acc, chip) => acc + chip.denomination * chipCount[chip.color],
                0
              );
              if (total !== 0) setChipTotalHistory([...chipTotalHistory, total]);
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
              if (total !== 0) setChipTotalHistory([...chipTotalHistory, total]);
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
              setChipTotalHistory([
                ...chipTotalHistory,
                chips.reduce((acc, chip) => acc + chip.denomination * chipCount[chip.color], 0),
              ]);
              setChipCount(Object.fromEntries(chips.map((chip) => [chip.color, 0])));
              //   Todo: interact with poker game
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
              // TODO
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
        <Grid columns={4} grow>
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
        </Grid>
        <Divider my="xs" />
        <Grid columns={12} grow gutter="xs">
          {["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"].map((rank) => {
            return (
              <Grid.Col span={["2", "3", "4", "5", "6", "7", "8", "9"].includes(rank) ? 3 : 2}>
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
                    } else if (settings.activeTab == "Blackjack" && blackjackGameState == "ROUND") {
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
                      document.dispatchEvent(new KeyboardEvent("keydown", { key: keybinding.key }));
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
      </Paper>
      <Paper
        withBorder
        p="xs"
        mt="xs"
        style={{
          backgroundColor: theme.colors.dark[7],
        }}
      >
        <Stack>
          {new Array(100).fill(0).map((_, index) => (
            <Text>xd</Text>
          ))}
        </Stack>
      </Paper>
    </ScrollArea>
  );
}

function getChipBreakdown(chips: Chip[], amount: number): { [key: string]: number } {
  const sortedChips = chips.sort((a, b) => b.denomination - a.denomination);
  const breakdown: { [key: string]: number } = {};
  let remaining = amount;
  sortedChips.forEach((chip) => {
    breakdown[chip.color] = Math.floor(remaining / chip.denomination);
    remaining -= breakdown[chip.color] * chip.denomination;
  });

  if (remaining > 0) {
    breakdown["Remaining"] = remaining;
  }
  return breakdown;
}
