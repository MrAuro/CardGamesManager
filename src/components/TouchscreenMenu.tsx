import { CHIPS_STATE } from "@/Root";
import { Chip } from "@/types/Settings";
import { formatMoney } from "@/utils/MoneyHelper";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Center,
  Code,
  ColorSwatch,
  Container,
  Divider,
  Flex,
  Grid,
  Group,
  Modal,
  NumberInput,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { IconMinus, IconPlus, IconX } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
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
    <Box m="xs">
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
                      opacity: chipChecked[chip.color] ? 1 : 0.35,
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
            variant="light"
            size="xl"
            onClick={() => {
              setChipTotalHistory([
                ...chipTotalHistory,
                chips.reduce((acc, chip) => acc + chip.denomination * chipCount[chip.color], 0),
              ]);
              setChipCount(Object.fromEntries(chips.map((chip) => [chip.color, 0])));
            }}
          >
            Clear
          </Button>
          <Button
            color="blue"
            variant="light"
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
              setChipTotalHistory([...chipTotalHistory, total]);
              setCalculatorValue(total);
              setInitialCalculatorValue(total);
            }}
          >
            Move to Calculator
          </Button>
          <Button
            color="green"
            variant="light"
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
            Bet/Raise
          </Button>
        </Group>
        <Divider my="xs" />
        <SimpleGrid cols={3}>
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
      <Paper withBorder p="xs" mt="xs">
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
        <Divider my="xs" />
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
    </Box>
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
