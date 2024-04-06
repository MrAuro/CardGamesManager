import { CHIPS_STATE } from "@/Root";
import { formatMoney } from "@/utils/MoneyHelper";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Center,
  Chip,
  Container,
  Divider,
  Flex,
  Grid,
  Group,
  NumberInput,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { IconMinus, IconPlus, IconX } from "@tabler/icons-react";
import { useEffect, useRef } from "react";
import { atom, useRecoilState, useRecoilValue } from "recoil";

const CHIP_COUNT = atom<{ [key: string]: number }>({
  key: "CHIP_COUNT",
  default: {},
});

const CHIP_TOTAL_HISTORY = atom<number[]>({
  key: "CHIP_TOTAL_HISTORY",
  default: [],
});

const MONOSPACE = "Fira Code, Fira Mono, Cascadia Code, monospace";

export default function TouchscreenMenu() {
  const chips = useRecoilValue(CHIPS_STATE);
  const [chipCount, setChipCount] = useRecoilState(CHIP_COUNT);
  const [chipTotalHistory, setChipTotalHistory] = useRecoilState(CHIP_TOTAL_HISTORY);
  const theme = useMantineTheme();

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
    if (chipTotalHistory.length > 5) {
      setChipTotalHistory(chipTotalHistory.slice(1));
    }
  }, [chipTotalHistory]);

  return (
    <Box m="xs">
      <Text size="xl" fw={500} c="dimmed">
        Chip Calculator
      </Text>
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

        <Button
          fullWidth
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
                    }}
                    onClick={() => {
                      setChipCount({
                        ...chipCount,
                        [chip.color]: 0,
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
                      }}
                      onClick={() => {
                        setChipCount({
                          ...chipCount,
                          [chip.color]: chipCount[chip.color] + 5,
                        });
                      }}
                    >
                      {chipCount[chip.color]}
                    </ActionIcon>
                    <ActionIcon
                      size="xl"
                      color={chip.color}
                      autoContrast
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
    </Box>
  );
}
