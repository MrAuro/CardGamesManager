import { BLACKJACK_GAME_STATE, BLACKJACK_SETTINGS } from "@/Root";
import { Checkbox, Grid, NumberInput, Text, Title, rem } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useRecoilState } from "recoil";

export default function BlackjackSettings() {
  const [blackjackSettings, setBlackjackSettings] = useRecoilState(BLACKJACK_SETTINGS);
  const [blackjackGame] = useRecoilState(BLACKJACK_GAME_STATE);

  return (
    <>
      <Title order={2}>Blackjack Settings</Title>
      <Grid mb="xs">
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <NumberInput
            label="Blackjack Payout"
            radius="md"
            allowNegative={false}
            thousandSeparator=","
            leftSection={<IconX />}
            placeholder="0"
            disabled={blackjackGame.gameState != "PREROUND"}
            value={blackjackSettings.blackjackPayout}
            decimalScale={2}
            fixedDecimalScale
            onChange={(value) =>
              setBlackjackSettings({
                ...blackjackSettings,
                blackjackPayout: parseFloat(`${value}`),
              })
            }
          />
        </Grid.Col>
      </Grid>
      {/* <Text size="lg" fw={500}>
        Side Bets
      </Text> */}

      <Text fw="bold" size="lg">
        Perfect Pairs
      </Text>
      <Checkbox
        radius="sm"
        label="Enabled"
        labelPosition="right"
        checked={blackjackSettings.perfectPairsEnabled}
        disabled={blackjackGame.gameState != "PREROUND"}
        onChange={(event) => {
          setBlackjackSettings({
            ...blackjackSettings,
            perfectPairsEnabled: event.currentTarget.checked,
          });
        }}
        styles={{
          input: {
            cursor: "pointer",
          },
        }}
      />
      {blackjackSettings.perfectPairsEnabled && (
        <>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 2 }}>
              <NumberInput
                label="Mixed"
                radius="md"
                allowNegative={false}
                thousandSeparator=","
                leftSection={<IconX />}
                placeholder="0"
                disabled={blackjackGame.gameState != "PREROUND"}
                value={blackjackSettings.perfectPairsMixedPayout}
                decimalScale={2}
                fixedDecimalScale
                onChange={(value) => {
                  setBlackjackSettings({
                    ...blackjackSettings,
                    perfectPairsMixedPayout: parseFloat(`${value}`),
                  });
                }}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 2 }}>
              <NumberInput
                label="Colored"
                radius="md"
                allowNegative={false}
                thousandSeparator=","
                leftSection={<IconX />}
                placeholder="0"
                disabled={blackjackGame.gameState != "PREROUND"}
                value={blackjackSettings.perfectPairsColoredPayout}
                decimalScale={2}
                fixedDecimalScale
                onChange={(value) => {
                  setBlackjackSettings({
                    ...blackjackSettings,
                    perfectPairsColoredPayout: parseFloat(`${value}`),
                  });
                }}
              />
            </Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <NumberInput
                label="Perfect"
                radius="md"
                allowNegative={false}
                thousandSeparator=","
                leftSection={<IconX />}
                placeholder="0"
                disabled={blackjackGame.gameState != "PREROUND"}
                value={blackjackSettings.perfectPairsSuitedPayout}
                decimalScale={2}
                fixedDecimalScale
                onChange={(value) =>
                  setBlackjackSettings({
                    ...blackjackSettings,
                    perfectPairsSuitedPayout: parseFloat(`${value}`),
                  })
                }
              />
            </Grid.Col>
          </Grid>
        </>
      )}

      <Text fw="bold" size="lg" mt="md">
        21+3
      </Text>
      <Checkbox
        radius="sm"
        label="Enabled"
        labelPosition="right"
        checked={blackjackSettings.twentyOnePlusThreeEnabled}
        disabled={blackjackGame.gameState != "PREROUND"}
        onChange={(event) =>
          setBlackjackSettings({
            ...blackjackSettings,
            twentyOnePlusThreeEnabled: event.currentTarget.checked,
          })
        }
        styles={{
          input: {
            cursor: "pointer",
          },
        }}
      />
      {blackjackSettings.twentyOnePlusThreeEnabled && (
        <>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 2 }}>
              <NumberInput
                label="Flush"
                radius="md"
                allowNegative={false}
                thousandSeparator=","
                leftSection={<IconX />}
                placeholder="0"
                disabled={blackjackGame.gameState != "PREROUND"}
                value={blackjackSettings.twentyOnePlusThreeFlushPayout}
                decimalScale={2}
                fixedDecimalScale
                onChange={(value) =>
                  setBlackjackSettings({
                    ...blackjackSettings,
                    twentyOnePlusThreeFlushPayout: parseFloat(`${value}`),
                  })
                }
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 2 }}>
              <NumberInput
                label="Straight"
                radius="md"
                allowNegative={false}
                thousandSeparator=","
                leftSection={<IconX />}
                placeholder="0"
                disabled={blackjackGame.gameState != "PREROUND"}
                value={blackjackSettings.twentyOnePlusThreeStraightPayout}
                decimalScale={2}
                fixedDecimalScale
                onChange={(value) => {
                  setBlackjackSettings({
                    ...blackjackSettings,
                    twentyOnePlusThreeStraightPayout: parseFloat(`${value}`),
                  });
                }}
              />
            </Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 2 }}>
              <NumberInput
                label="Three of a Kind"
                radius="md"
                allowNegative={false}
                thousandSeparator=","
                leftSection={<IconX />}
                placeholder="0"
                disabled={blackjackGame.gameState != "PREROUND"}
                value={blackjackSettings.twentyOnePlusThreeThreeOfAKindPayout}
                decimalScale={2}
                fixedDecimalScale
                onChange={(value) => {
                  setBlackjackSettings({
                    ...blackjackSettings,
                    twentyOnePlusThreeThreeOfAKindPayout: parseFloat(`${value}`),
                  });
                }}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 2 }}>
              <NumberInput
                label="Straight Flush"
                radius="md"
                allowNegative={false}
                thousandSeparator=","
                leftSection={<IconX />}
                placeholder="0"
                disabled={blackjackGame.gameState != "PREROUND"}
                value={blackjackSettings.twentyOnePlusThreeStraightFlushPayout}
                decimalScale={2}
                fixedDecimalScale
                onChange={(value) => {
                  setBlackjackSettings({
                    ...blackjackSettings,
                    twentyOnePlusThreeStraightFlushPayout: parseFloat(`${value}`),
                  });
                }}
              />
            </Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <NumberInput
                label="Suited Three of a Kind"
                radius="md"
                allowNegative={false}
                thousandSeparator=","
                leftSection={<IconX />}
                placeholder="0"
                disabled={blackjackGame.gameState != "PREROUND"}
                value={blackjackSettings.twentyOnePlusThreeThreeOfAKindSuitedPayout}
                decimalScale={2}
                fixedDecimalScale
                onChange={(value) => {
                  setBlackjackSettings({
                    ...blackjackSettings,
                    twentyOnePlusThreeThreeOfAKindSuitedPayout: parseFloat(`${value}`),
                  });
                }}
              />
            </Grid.Col>
          </Grid>
        </>
      )}
      <Text fw="bold" size="lg" mt="md">
        Bet Behind
      </Text>
      <Checkbox
        mt={rem(5)}
        radius="sm"
        label="Enabled"
        labelPosition="right"
        checked={blackjackSettings.betBehindEnabled}
        disabled={blackjackGame.gameState != "PREROUND"}
        onChange={(event) => {
          setBlackjackSettings({
            ...blackjackSettings,
            betBehindEnabled: event.currentTarget.checked,
          });
        }}
        styles={{
          input: {
            cursor: "pointer",
          },
        }}
      />
    </>
  );
}
