import { BLACKJACK_GAME_STATE, BLACKJACK_SETTINGS } from "@/Root";
import { Checkbox, Grid, InputWrapper, NumberInput, Text, Title, rem } from "@mantine/core";
import { IconStack2, IconX } from "@tabler/icons-react";
import { useRecoilState } from "recoil";

export default function BlackjackSettings() {
  const [blackjackSettings, setBlackjackSettings] = useRecoilState(BLACKJACK_SETTINGS);
  const [blackjackGame] = useRecoilState(BLACKJACK_GAME_STATE);

  return (
    <>
      <Title order={2}>Blackjack Settings</Title>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <InputWrapper label="Deck Count" mb="xs">
            <NumberInput
              radius="md"
              allowNegative={false}
              decimalScale={0}
              fixedDecimalScale
              leftSection={<IconStack2 />}
              placeholder="0"
              disabled={blackjackGame.gameState != "PREROUND"}
              value={blackjackSettings.decks}
              onChange={(value) => {
                setBlackjackSettings({
                  ...blackjackSettings,
                  decks: parseInt(`${value}`),
                });
              }}
            />
          </InputWrapper>
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
