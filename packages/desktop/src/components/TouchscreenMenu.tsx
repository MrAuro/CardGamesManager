import { HOTKEY_SELECTOR_A_ENABLED, HOTKEY_SELECTOR_B_ENABLED } from "@/App";
import {
  BLACKJACK_GAME_STATE,
  CHIPS_STATE,
  KEYBINDINGS_STATE,
  PLAYERS_STATE,
  POKER_GAME_STATE,
  SETTINGS_STATE,
} from "@/Root";
import { emitBjAction } from "@/pages/Blackjack/routes/Round";
import { FOCUSED_PLAYER } from "@/pages/Players";
import { emitPokerAction } from "@/pages/Poker/routes/Round";
import { CardRank, CardSuit } from "@/types/Card";
import { Scope } from "@/types/Keybindings";
import { suitToIcon } from "@/utils/CardHelper";
import { formatMoney } from "@/utils/MoneyHelper";
import { useRecoilImmerState } from "@/utils/RecoilImmer";
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
import { UUID } from "crypto";
import cloneDeep from "lodash/cloneDeep";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { atom, useRecoilState, useRecoilValue } from "recoil";
import { CHIP_BREAKDOWN_AMOUNT, CHIP_BREAKDOWN_OPEN } from "./ChipBreakdown";

const CHIP_COUNT = atom<{ [key: UUID]: number }>({
  key: "CHIP_COUNT",
  default: {},
});

const CHIP_HISTORY = atom<{ [key: UUID]: number }[]>({
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

  const [, setPlayers] = useRecoilImmerState(PLAYERS_STATE);
  const [focusedPlayer, setFocusedPlayer] = useRecoilState(FOCUSED_PLAYER);

  const [foldConfirm, setFoldConfirm] = useState(false);

  const [selectorA, setHotkeySelectorAEnabled] = useRecoilState(HOTKEY_SELECTOR_A_ENABLED);
  const [selectorB, setHotkeySelectorBEnabled] = useRecoilState(HOTKEY_SELECTOR_B_ENABLED);

  const [lastChipUsed, setLastChipUsed] = useState<UUID | null>(null);

  keybindings.forEach((keybinding) => {
    if (keybinding.scope == "Chips Menu") {
      useHotkeys(keybinding.key, () => {
        if (settings.activeTab == "Settings") return;
        if (keybinding.selector == "A" && !selectorA) return;
        if (keybinding.selector == "B" && !selectorB) return;

        if (keybinding.selector == "None" && (selectorA || selectorB)) return;

        switch (keybinding.action) {
          case "Remove Last Chip":
            {
              if (lastChipUsed) {
                if (Math.floor(chipCount[lastChipUsed] / 10) < 1) {
                  setChipCount({
                    ...chipCount,
                    [lastChipUsed]: 0,
                  });
                } else {
                  setChipCount({
                    ...chipCount,
                    [lastChipUsed]: Math.floor(chipCount[lastChipUsed] / 10),
                  });
                }
              }
            }
            break;

          case "Flatten":
            {
              alert("This feature was removed in version 2.4.0 to simplify the chips menu");
            }
            break;

          case "Clear":
            {
              setChipCount(Object.fromEntries(chips.map((chip) => [chip.id, 0])));
            }
            break;

          case "Bet/Raise/Set Balance":
            {
              let total = chips.reduce(
                (acc, chip) => acc + chip.denomination * chipCount[chip.id],
                0
              );

              if (settings.activeTab == "Players") {
                if (focusedPlayer) {
                  setPlayers((draft) => {
                    const player = draft.find((p) => p.id === focusedPlayer);
                    if (player) {
                      player.balance = total;
                    }
                  });
                  setFocusedPlayer(null);
                } else {
                  alert(`Focus a player before setting their balance.`);
                }
              } else if (settings.activeTab == "Poker" && pokerGameState != "PREROUND") {
                emitPokerAction(total);
              } else if (settings.activeTab == "Blackjack" && blackjackGameState == "ROUND") {
                emitBjAction(total);
              }

              if (settings.autoClearChipTotal) {
                setChipCount(Object.fromEntries(chips.map((chip) => [chip.id, 0])));
              }

              // We use a timeout to prevent the hotkey from being triggered twice
              setTimeout(() => {
                setHotkeySelectorAEnabled(false);
                setHotkeySelectorBEnabled(false);
              }, 100);
            }
            break;

          case "0":
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
          case "7":
          case "8":
          case "9":
            {
              if (lastChipUsed) {
                if (chipCount[lastChipUsed] == 1) {
                  if (keybinding.action == "0") {
                    setChipCount({
                      ...chipCount,
                      [lastChipUsed]: chipCount[lastChipUsed] * 10,
                    });
                  } else {
                    setChipCount({
                      ...chipCount,
                      [lastChipUsed]: parseInt(keybinding.action),
                    });
                  }
                } else {
                  {
                    setChipCount({
                      ...chipCount,
                      [lastChipUsed]: chipCount[lastChipUsed] * 10 + parseInt(keybinding.action),
                    });
                  }
                }
              }
            }
            break;

          default: {
            // #f8f9fa ($3) (36a518d4-f37c-41f4-a2e7-026c3b9da6c8) and we want: 36a518d4-f37c-41f4-a2e7-026c3b9da6c8
            const uuidParseRegex = /^#[0123456789abcdef]{6}\s\(\$.+\)\s\((.+)\)$/;
            let key = keybinding.action.match(uuidParseRegex)![1] as UUID;
            let chip = chips.find((chip) => chip.id === key);
            if (chip) {
              setChipCount({
                ...chipCount,
                [chip.id]: chipCount[chip.id] + 1,
              });
              setLastChipUsed(chip.id);
            }
          }
        }
      });
    }
  });

  useEffect(() => {
    if (Object.keys(chipCount).length !== chips.length) {
      const newChipCount: { [key: string]: number } = {};
      chips.forEach((chip) => {
        if (!chipCount[chip.id]) {
          newChipCount[chip.id] = 0;
        } else {
          newChipCount[chip.id] = chipCount[chip.id];
        }
      });
      setChipCount(newChipCount);
    }
  }, [chipCount]);

  useEffect(() => {
    if (chipHistory.length > 4) {
      setChipHistory(chipHistory.slice(1));
    }
  }, [chipHistory]);

  useEffect(() => {
    if (calculatorHistory.length > 4) {
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
            size="lg"
            fw={800}
            style={{
              fontFamily: "monospace",
              fontSize: "1.65rem",
              cursor: "pointer",
            }}
            onClick={() => {
              setChipBreakdownOpen(true);
              setChipBreakdownAmount(
                chips.reduce((acc, chip) => acc + chip.denomination * chipCount[chip.id], 0)
              );
            }}
          >
            {formatMoney(
              chips.reduce((acc, chip) => acc + chip.denomination * chipCount[chip.id], 0)
            )}{" "}
          </Text>
          <Flex direction="row-reverse" gap="xs">
            {chipHistory.map((_chips: { [key: UUID]: number }, index) => {
              let total = 0;
              for (const [key, value] of Object.entries(_chips)) {
                total += chips.find((chip) => chip.id === key)!.denomination * value;
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
                    if (_chips === chipCount) {
                      setChipHistory((draft) => {
                        let newDraft = cloneDeep(draft);
                        newDraft.splice(index, 1);
                        return newDraft;
                      });
                    } else {
                      setChipCount(_chips);
                    }
                  }}
                >
                  {formatMoney(total)}
                </Badge>
              );
            })}
          </Flex>
        </Flex>

        <Group grow gap="xs">
          <Button
            color="red"
            size="lg"
            onClick={() => {
              // Check if we have an identical chip count in history. If we don't, then add it.
              if (
                !chipHistory.find(
                  (history) => JSON.stringify(history) === JSON.stringify(chipCount)
                )
              ) {
                setChipHistory([...chipHistory, chipCount]);
              }
              setChipCount(Object.fromEntries(chips.map((chip) => [chip.id, 0])));
            }}
          >
            Clear
          </Button>
          {settings.touchscreenMenuCalculator && (
            <Button
              color="blue"
              size="lg"
              p="xs"
              style={{
                fontSize: "1rem",
              }}
              onClick={() => {
                let total = chips.reduce(
                  (acc, chip) => acc + chip.denomination * chipCount[chip.id],
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
          )}
          <Button
            color="green"
            size="lg"
            p="xs"
            disabled={settings.activeTab == "Players" && !focusedPlayer}
            onClick={() => {
              let total = chips.reduce(
                (acc, chip) => acc + chip.denomination * chipCount[chip.id],
                0
              );
              setChipHistory([...chipHistory, chipCount]);

              if (settings.activeTab == "Players") {
                if (focusedPlayer) {
                  setPlayers((draft) => {
                    const player = draft.find((p) => p.id === focusedPlayer);
                    if (player) {
                      player.balance = total;
                    }
                  });
                  setFocusedPlayer(null);
                } else {
                  alert(`Focus a player before setting their balance.`);
                }
              } else if (settings.activeTab == "Poker" && pokerGameState != "PREROUND") {
                emitPokerAction(total);
              } else if (settings.activeTab == "Blackjack" && blackjackGameState == "ROUND") {
                emitBjAction(total);
              }
            }}
          >
            {settings.activeTab == "Players" ? "Set Balance" : "Bet"}
          </Button>
          {settings.activeTab == "Players" && (
            <Button
              color="green"
              size="lg"
              p="xs"
              disabled={settings.activeTab == "Players" && !focusedPlayer}
              onClick={() => {
                let total = chips.reduce(
                  (acc, chip) => acc + chip.denomination * chipCount[chip.id],
                  0
                );
                setChipHistory([...chipHistory, chipCount]);
                setChipCount(Object.fromEntries(chips.map((chip) => [chip.id, 0])));

                if (focusedPlayer) {
                  setPlayers((draft) => {
                    const player = draft.find((p) => p.id === focusedPlayer);
                    if (player) {
                      player.balance += total;
                    }
                  });
                  setFocusedPlayer(null);
                } else {
                  alert(`Focus a player before setting their balance.`);
                }
              }}
            >
              Add
            </Button>
          )}
        </Group>
        <Divider my="xs" />
        <SimpleGrid
          cols={settings.touchscreenMenuChipsColumns || 4}
          spacing="xs"
          verticalSpacing="xs"
        >
          {chips.map((chip) => {
            return (
              <Paper
                key={chip.id}
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
                        [chip.id]: chipCount[chip.id] + 20,
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
                    p={2}
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 600,
                      fontFamily: MONOSPACE,
                      opacity: chipCount[chip.id] === 0 ? 0.5 : 1,
                    }}
                    onClick={() => {
                      setChipCount({
                        ...chipCount,
                        [chip.id]: chipCount[chip.id] + 5,
                      });
                    }}
                  >
                    {formatMoney(chip.denomination * chipCount[chip.id])}
                  </Button>
                </Center>
                <Flex direction="row" align="center" justify="center">
                  <SimpleGrid cols={3} spacing="xs">
                    <ActionIcon
                      size="lg"
                      color={chip.color}
                      autoContrast
                      style={{
                        opacity: 0.5,
                      }}
                      onClick={() => {
                        setChipCount({
                          ...chipCount,
                          [chip.id]: chipCount[chip.id] + 1,
                        });
                      }}
                    >
                      <IconPlus strokeWidth={4} />
                    </ActionIcon>
                    <ActionIcon
                      color={chip.color}
                      autoContrast
                      variant="filled"
                      size="lg"
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 500,
                        fontFamily: MONOSPACE,
                        opacity: chipCount[chip.id] === 0 ? 0.5 : 1,
                      }}
                      onClick={() => {
                        setChipCount({
                          ...chipCount,
                          [chip.id]: 0,
                        });
                      }}
                    >
                      {chipCount[chip.id]}
                    </ActionIcon>
                    <ActionIcon
                      size="lg"
                      color={chip.color}
                      autoContrast
                      style={{
                        opacity: 0.5,
                      }}
                      onClick={() => {
                        setChipCount({
                          ...chipCount,
                          [chip.id]: Math.max(chipCount[chip.id] - 1, 0),
                        });
                      }}
                    >
                      <IconMinus strokeWidth={4} />
                    </ActionIcon>
                  </SimpleGrid>
                </Flex>
                <Flex direction="row" align="center" justify="center" gap={5}>
                  <Button
                    variant="subtle"
                    color="white"
                    size="compact-md"
                    style={{
                      fontFamily: MONOSPACE,
                      opacity: 0.5,
                    }}
                    onClick={() => {
                      setChipCount({
                        ...chipCount,
                        [chip.id]: chipCount[chip.id] + 5,
                      });
                    }}
                  >
                    +5
                  </Button>
                  <Button
                    variant="subtle"
                    color="white"
                    size="compact-md"
                    c="white"
                    style={{
                      fontFamily: MONOSPACE,
                      opacity: 0.5,
                    }}
                    onClick={() => {
                      setChipCount({
                        ...chipCount,
                        [chip.id]: chipCount[chip.id] + 20,
                      });
                    }}
                  >
                    +20
                  </Button>
                  <Button
                    variant="subtle"
                    color="white"
                    size="compact-md"
                    c="white"
                    style={{
                      fontFamily: MONOSPACE,
                      opacity: 0.5,
                    }}
                    onClick={() => {
                      setChipCount({
                        ...chipCount,
                        [chip.id]: 0,
                      });
                    }}
                  >
                    0
                  </Button>
                </Flex>
              </Paper>
            );
          })}
        </SimpleGrid>
      </Paper>
      {settings.touchscreenMenuCalculator && (
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
              size="lg"
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
          <SimpleGrid cols={4} spacing="xs" verticalSpacing="xs">
            <Button
              size="lg"
              onClick={() => {
                if (calculatorValue === 0) {
                  let total = chips.reduce(
                    (acc, chip) => acc + chip.denomination * chipCount[chip.id],
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
              size="lg"
              onClick={() => {
                if (calculatorValue === 0) {
                  let total = chips.reduce(
                    (acc, chip) => acc + chip.denomination * chipCount[chip.id],
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
              size="lg"
              onClick={() => {
                if (calculatorValue === 0) {
                  let total = chips.reduce(
                    (acc, chip) => acc + chip.denomination * chipCount[chip.id],
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
              size="lg"
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
              size="lg"
              p={0}
              disabled={intitalCalculatorValue == 0}
              onClick={() => {
                setCalculatorValue(calculatorValue + intitalCalculatorValue);
              }}
            >
              +{formatMoney(intitalCalculatorValue)}
            </Button>
            <Button
              size="lg"
              p={0}
              disabled={intitalCalculatorValue == 0}
              onClick={() => {
                setCalculatorValue(calculatorValue - intitalCalculatorValue);
              }}
            >
              -{formatMoney(intitalCalculatorValue)}
            </Button>
            <Button
              size="lg"
              color="grape"
              disabled={calculatorValue === intitalCalculatorValue || intitalCalculatorValue === 0}
              p={0}
              onClick={() => setCalculatorValue(intitalCalculatorValue)}
            >
              Reset
            </Button>
            <Button
              size="lg"
              color="red"
              disabled={calculatorValue === 0}
              p={0}
              onClick={() => {
                if (!calculatorHistory.includes(calculatorValue)) {
                  setCalculatorHistory([...calculatorHistory, calculatorValue]);
                }
                setCalculatorValue(0);
                setInitialCalculatorValue(0);
              }}
            >
              Clear
            </Button>
          </SimpleGrid>
        </Paper>
      )}

      <Paper
        withBorder
        p="xs"
        mt="xs"
        style={{
          backgroundColor: theme.colors.dark[7],
        }}
      >
        <Grid columns={8} grow gutter="xs">
          {(
            [
              { value: "7", type: "rank" },
              { value: "8", type: "rank" },
              { value: "9", type: "rank" },
              { value: "h", type: "suit" },
              { value: "4", type: "rank" },
              { value: "5", type: "rank" },
              { value: "6", type: "rank" },
              { value: "s", type: "suit" },
              { value: "1", type: "rank" },
              { value: "2", type: "rank" },
              { value: "3", type: "rank" },
              { value: "d", type: "suit" },
              { value: "J", type: "rank" },
              { value: "Q", type: "rank" },
              { value: "K", type: "rank" },
              { value: "c", type: "suit" },
              { value: "A", type: "rank", wider: true },
              { value: "T", type: "rank", wider: true },
              { value: "Remove Last Card", type: "other" },
            ] as {
              value: CardRank | CardSuit | "Remove Last Card";
              type: "rank" | "suit" | "other";
              wider: boolean;
            }[]
          ).map((item) => {
            let color: "red" | "dark" | "blue" | "green" | "gray" | "white" = "gray";
            if (item.value == "Remove Last Card") color = "white";

            if (item.type == "suit") {
              color = item.value == "h" || item.value == "d" ? "red" : "dark";
              if (settings.fourColorDeck) {
                if (item.value == "d") {
                  color = "blue";
                } else if (item.value == "c") {
                  color = "green";
                }
              }
            }

            return (
              <Grid.Col key={item.value} span={item.wider ? 3 : 2}>
                <Button
                  size="xl"
                  p="xs"
                  color={color}
                  fullWidth
                  autoContrast={color == "white"}
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    height: "100%",
                    width: "100",
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
                        keybinding.action == item.value &&
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
                        `Missing keybinding for scope: "${targetScope}" and action: "${item.value}" and selector: "None". Add before using this button.`
                      );
                    }
                  }}
                >
                  {item.value == "Remove Last Card" ? (
                    <IconBackspaceFilled size="2rem" />
                  ) : item.type == "suit" ? (
                    suitToIcon(item.value as CardSuit)
                  ) : (
                    item.value
                  )}
                </Button>
              </Grid.Col>
            );
          })}
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
              size="lg"
              color="green"
              onClick={() => {
                emitPokerAction("check");
              }}
            >
              Check
            </Button>
            <Button
              size="lg"
              color="blue"
              onClick={() => {
                emitPokerAction("call");
              }}
            >
              Call
            </Button>
            <Button
              size="lg"
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
              size="lg"
              color="green"
              onClick={() => {
                emitBjAction("stand");
              }}
            >
              Stand
            </Button>
            <Button
              size="lg"
              color="red"
              onClick={() => {
                emitBjAction("double");
              }}
            >
              Double
            </Button>
            <Button
              size="lg"
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
              size="lg"
              color="red"
              variant="light"
              onClick={() => {
                emitBjAction("forcebust");
              }}
            >
              Bust
            </Button>
            <Button
              size="lg"
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
