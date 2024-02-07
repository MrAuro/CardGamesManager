import {
  Button,
  Container,
  Divider,
  Grid,
  Input,
  InputWrapper,
  NumberInput,
  Text,
  Slider,
  useMantineColorScheme,
  Alert,
  Title,
  // useMantineTheme,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCode,
  IconCodeOff,
  IconCurrencyDollar,
  IconDatabase,
  IconKeyboard,
  IconKeyboardOff,
  IconMoon,
  IconPokerChip,
  IconSun,
} from "@tabler/icons-react";
import { useRecoilState } from "recoil";
import { STATE, State } from "../App";
import { modals } from "@mantine/modals";
import { useCustomRecoilState } from "../utils/RecoilHelper";

export default function Settings() {
  const [state, setState, modifyState] = useCustomRecoilState<State>(STATE);
  // const theme = useMantineTheme();
  const { setColorScheme, colorScheme } = useMantineColorScheme();

  return (
    <Container>
      <Title order={2}>Interface</Title>
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
            modifyState({ scale: (value / 100) as 1 });
          }}
        />
      </Input.Wrapper>
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
      <InputWrapper label="Show Debug Info" mb="md">
        <Button.Group>
          <Button
            variant={state.showDebugInfo ? "filled" : "default"}
            leftSection={<IconCode />}
            onClick={() => {
              modifyState({ showDebugInfo: true });
            }}
          >
            On
          </Button>
          <Button
            variant={!state.showDebugInfo ? "filled" : "default"}
            leftSection={<IconCodeOff />}
            onClick={() => {
              modifyState({ showDebugInfo: false });
            }}
          >
            Off
          </Button>
        </Button.Group>
      </InputWrapper>
      <InputWrapper label="Use Keyboard Shortcuts" mb="md">
        <Button.Group>
          <Button
            variant={state.useKeybindings ? "filled" : "default"}
            leftSection={<IconKeyboard />}
            onClick={() => {
              modifyState({ useKeybindings: true });
            }}
          >
            On
          </Button>
          <Button
            variant={!state.useKeybindings ? "filled" : "default"}
            leftSection={<IconKeyboardOff />}
            onClick={() => {
              modifyState({ useKeybindings: false });
            }}
          >
            Off
          </Button>
        </Button.Group>
      </InputWrapper>
      <Divider my="sm" />
      <Title order={2}>Poker</Title>
      {state.currentGamePlaying != "NONE" && (
        <Alert
          variant="light"
          color="red"
          title="Game in progress"
          icon={<IconAlertCircle />}
          mb="sm"
        >
          You cannot change bet settings while a game is in progress.
        </Alert>
      )}
      <InputWrapper label="Forced Bet Type" mb="xs">
        <Button.Group>
          <Button
            variant={state.poker.forcedBetType == "BLINDS" ? "filled" : "default"}
            leftSection={<IconDatabase />}
            disabled={state.currentGamePlaying != "NONE"}
            onClick={() => {
              modifyState({
                poker: { ...state.poker, forcedBetType: "BLINDS" },
              });
            }}
          >
            Blinds
          </Button>
          <Button
            variant={state.poker.forcedBetType == "ANTE" ? "filled" : "default"}
            leftSection={<IconPokerChip />}
            disabled={state.currentGamePlaying != "NONE"}
            onClick={() => {
              modifyState({
                poker: { ...state.poker, forcedBetType: "ANTE" },
              });
            }}
          >
            Ante
          </Button>
          <Button
            variant={state.poker.forcedBetType == "BLINDS+ANTE" ? "filled" : "default"}
            leftSection={<IconPokerChip />}
            disabled={state.currentGamePlaying != "NONE"}
            onClick={() => {
              modifyState({
                poker: { ...state.poker, forcedBetType: "BLINDS+ANTE" },
              });
            }}
          >
            Blinds & Ante
          </Button>
        </Button.Group>
      </InputWrapper>
      <Grid gutter="xs">
        {(state.poker.forcedBetType == "BLINDS" || state.poker.forcedBetType == "BLINDS+ANTE") && (
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
                disabled={state.currentGamePlaying != "NONE"}
                value={state.poker.bigBlind}
                onChange={(value) => {
                  modifyState({
                    poker: {
                      bigBlind: parseFloat(`${value}`),
                    },
                  });
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
                disabled={state.currentGamePlaying != "NONE"}
                value={state.poker.smallBlind}
                onChange={(value) => {
                  modifyState({
                    poker: {
                      smallBlind: parseFloat(`${value}`),
                    },
                  });
                }}
              />
            </Grid.Col>
          </>
        )}
        {(state.poker.forcedBetType == "ANTE" || state.poker.forcedBetType == "BLINDS+ANTE") && (
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
                disabled={state.currentGamePlaying != "NONE"}
                value={state.poker.ante}
                onChange={(value) => {
                  modifyState({ poker: { ante: parseFloat(`${value}`) } });
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
          modals.openConfirmModal({
            title: "Reset everything",
            children: (
              <Text size="sm">
                Are you sure you want to reset everything? This will clear all games, settings, and
                player data.
              </Text>
            ),
            labels: { confirm: "Reset everything", cancel: "Cancel" },
            confirmProps: { color: "red" },
            onCancel: () => {},
            onConfirm: () => {
              localStorage.clear();
              window.location.reload();
            },
          });
        }}
      >
        Reset Everything
      </Button>
    </Container>
  );
}
