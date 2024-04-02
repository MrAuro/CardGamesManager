import { POKER_GAME_STATE, POKER_SETTINGS_STATE } from "@/Root";
import { Button, ButtonGroup, Grid, Input, NumberInput, Title } from "@mantine/core";
import {
  IconBusinessplan,
  IconCoins,
  IconCurrencyDollar,
  IconPokerChip,
} from "@tabler/icons-react";
import { useRecoilState } from "recoil";

export default function PokerSettings() {
  const [pokerSettings, setPokerSettings] = useRecoilState(POKER_SETTINGS_STATE);
  const [pokerGame] = useRecoilState(POKER_GAME_STATE);

  return (
    <>
      <Title order={2}>Poker Settings</Title>
      <Input.Wrapper label="Forced Bet" description="Use blinds or antes for forced bets">
        <ButtonGroup mt={5}>
          <Button
            variant={pokerSettings.forcedBetOption == "BLINDS" ? "filled" : "default"}
            leftSection={<IconCoins />}
            onClick={() => {
              setPokerSettings({ ...pokerSettings, forcedBetOption: "BLINDS" });
            }}
          >
            Blinds
          </Button>
          <Button
            variant={pokerSettings.forcedBetOption == "ANTE" ? "filled" : "default"}
            leftSection={<IconPokerChip />}
            onClick={() => {
              setPokerSettings({ ...pokerSettings, forcedBetOption: "ANTE" });
            }}
          >
            Antes
          </Button>
          <Button
            variant={pokerSettings.forcedBetOption == "BLINDS+ANTE" ? "filled" : "default"}
            leftSection={<IconBusinessplan />}
            onClick={() => {
              setPokerSettings({ ...pokerSettings, forcedBetOption: "BLINDS+ANTE" });
            }}
          >
            Blinds & Antes
          </Button>
        </ButtonGroup>
      </Input.Wrapper>
      <Grid my="xs">
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <NumberInput
            label="Small Blind"
            radius="md"
            allowNegative={false}
            thousandSeparator=","
            leftSection={<IconCurrencyDollar />}
            placeholder="0"
            disabled={pokerGame.gameState != "PREROUND"}
            value={pokerSettings.smallBlind}
            decimalScale={2}
            fixedDecimalScale
            onChange={(value) =>
              setPokerSettings({
                ...pokerSettings,
                smallBlind: parseFloat(`${value}`),
              })
            }
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <NumberInput
            label="Big Blind"
            radius="md"
            allowNegative={false}
            thousandSeparator=","
            leftSection={<IconCurrencyDollar />}
            placeholder="0"
            disabled={pokerGame.gameState != "PREROUND"}
            value={pokerSettings.bigBlind}
            decimalScale={2}
            fixedDecimalScale
            onChange={(value) =>
              setPokerSettings({
                ...pokerSettings,
                bigBlind: parseFloat(`${value}`),
              })
            }
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <NumberInput
            label="Ante"
            radius="md"
            allowNegative={false}
            thousandSeparator=","
            leftSection={<IconCurrencyDollar />}
            placeholder="0"
            disabled={pokerGame.gameState != "PREROUND"}
            value={pokerSettings.ante}
            decimalScale={2}
            fixedDecimalScale
            onChange={(value) => {
              setPokerSettings({
                ...pokerSettings,
                ante: parseFloat(`${value}`),
              });
            }}
          />
        </Grid.Col>
      </Grid>
    </>
  );
}
