import { CHIPS_STATE } from "@/Root";
import { formatMoney } from "@/utils/MoneyHelper";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Center,
  Chip,
  Divider,
  Flex,
  Grid,
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { useEffect, useRef } from "react";
import { atom, useRecoilState, useRecoilValue } from "recoil";

const CHIP_COUNT = atom<{ [key: string]: number }>({
  key: "CHIP_COUNT",
  default: {},
});

const MONOSPACE = "Fira Code, Fira Mono, Cascadia Code, monospace";

export default function TouchscreenMenu() {
  const chips = useRecoilValue(CHIPS_STATE);
  const [chipCount, setChipCount] = useRecoilState(CHIP_COUNT);
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

  return (
    <Box m="xs">
      <Text size="xl" fw={500} c="dimmed">
        Chip Calculator
      </Text>
      <Paper
        withBorder
        p="xs"
        style={{
          backgroundColor: theme.colors.dark[7],
        }}
      >
        <Text
          size="xl"
          fw={500}
          style={{
            fontFamily: "monospace",
          }}
        >
          Total:{" "}
          {formatMoney(
            chips.reduce((acc, chip) => acc + chip.denomination * chipCount[chip.color], 0)
          )}
        </Text>
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
                  <Badge
                    size="lg"
                    color={chip.color}
                    autoContrast
                    style={{
                      fontFamily: MONOSPACE,
                    }}
                  >
                    {formatMoney(chip.denomination, false, true)}
                  </Badge>
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
