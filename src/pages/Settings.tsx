import {
  Button,
  Container,
  Divider,
  Grid,
  Input,
  InputWrapper,
  NumberInput,
  Slider,
  useMantineColorScheme,
  // useMantineTheme,
} from "@mantine/core";
import {
  IconCurrencyDollar,
  IconDatabase,
  IconMoon,
  IconPokerChip,
  IconSun,
} from "@tabler/icons-react";
import { useRecoilState } from "recoil";
import { STATE, State } from "../App";

export default function Settings() {
  const [state, setState] = useRecoilState<State>(STATE);
  // const theme = useMantineTheme();
  const { setColorScheme, colorScheme } = useMantineColorScheme();

  return (
    <Container>
      <Input.Wrapper label="UI Scale" mb="xl">
        <Slider
          defaultValue={state.scale * 100}
          min={70}
          max={130}
          step={5}
          marks={[
            {
              label: "70%",
              value: 70,
            },
            {
              value: 80,
            },
            {
              value: 90,
            },
            {
              label: "100%",
              value: 100,
            },
            {
              value: 110,
            },
            {
              value: 100,
            },
            {
              value: 120,
            },
            {
              label: "130%",
              value: 130,
            },
          ]}
          onChange={(value) => {
            setState({ ...state, scale: (value / 100) as 1 });
          }}
        />
      </Input.Wrapper>
      <Divider my="sm" />
      <InputWrapper label="Color Scheme" mb="md">
        <Button.Group>
          <Button
            variant={colorScheme == "light" ? "filled" : "default"}
            leftSection={<IconSun />}
            onClick={() => setColorScheme("light")}
          >
            Light
          </Button>
          <Button
            variant={colorScheme == "dark" ? "filled" : "default"}
            leftSection={<IconMoon />}
            onClick={() => setColorScheme("dark")}
          >
            Dark
          </Button>
        </Button.Group>
      </InputWrapper>
      <Divider my="sm" />
      <InputWrapper label="Forced Bet Type" mb="xs">
        <Button.Group>
          <Button
            variant={state.forcedBetType == "BLINDS" ? "filled" : "default"}
            leftSection={<IconDatabase />}
            onClick={() => {
              setState({ ...state, forcedBetType: "BLINDS" });
            }}
          >
            Blinds
          </Button>
          <Button
            variant={state.forcedBetType == "ANTE" ? "filled" : "default"}
            leftSection={<IconPokerChip />}
            onClick={() => {
              setState({ ...state, forcedBetType: "ANTE" });
            }}
          >
            Ante
          </Button>
        </Button.Group>
      </InputWrapper>
      <Grid gutter="xs">
        {state.forcedBetType == "BLINDS" ? (
          <>
            <Grid.Col span={{ base: 12, sm: 2 }}>
              <NumberInput
                label="Big Blind"
                radius="md"
                allowNegative={false}
                decimalScale={2}
                fixedDecimalScale
                thousandSeparator=","
                leftSection={<IconCurrencyDollar />}
                placeholder="0.00"
                value={state.bigBlind}
                onChange={(value) => {
                  setState({ ...state, bigBlind: parseInt(`${value}`) });
                }}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 2 }}>
              <NumberInput
                label="Small Blind"
                radius="md"
                allowNegative={false}
                decimalScale={2}
                fixedDecimalScale
                thousandSeparator=","
                leftSection={<IconCurrencyDollar />}
                placeholder="0.00"
                value={state.littleBlind}
                onChange={(value) => {
                  setState({ ...state, littleBlind: parseInt(`${value}`) });
                }}
              />
            </Grid.Col>
          </>
        ) : (
          <>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <NumberInput
                label="Ante"
                radius="md"
                allowNegative={false}
                decimalScale={2}
                fixedDecimalScale
                thousandSeparator=","
                leftSection={<IconCurrencyDollar />}
                placeholder="0.00"
                value={state.ante}
                onChange={(value) => {
                  setState({ ...state, ante: parseInt(`${value}`) });
                }}
              />
            </Grid.Col>
          </>
        )}
      </Grid>
      <Divider my="sm" />
      <Button
        color="red"
        onClick={() => {
          localStorage.clear();
          window.location.reload();
        }}
      >
        Reset Game
      </Button>
    </Container>
  );
}
