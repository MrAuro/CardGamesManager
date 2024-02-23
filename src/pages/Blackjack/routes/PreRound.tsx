import { BLACKJACK_SETTINGS } from "@/Root";
import PlayerSelector from "@/components/PlayerSelector";
import { BlackjackSettings } from "@/types/Blackjack";
import { formatMoney } from "@/utils/MoneyHelper";
import { Draggable, DraggableStateSnapshot } from "@hello-pangea/dnd";
import {
  Button,
  ButtonGroup,
  Card,
  Collapse,
  Divider,
  Grid,
  Group,
  NumberInput,
  Select,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import {
  IconArrowsShuffle,
  IconChevronsDown,
  IconCurrencyDollar,
  IconUserSearch,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import { useRecoilState } from "recoil";

function getStyle(style: any, snapshot: DraggableStateSnapshot) {
  if (!snapshot.isDropAnimating) {
    return style;
  }
  const { curve, duration } = snapshot.dropAnimation!;

  return {
    ...style,
    opacity: snapshot.isDragging && !snapshot.isDropAnimating ? 0.65 : 1,
    transition: `all ${curve} ${duration + 500}ms`,
  };
}

export default function PreRound() {
  const theme = useMantineTheme();
  const [blackjackSettings] = useRecoilState(BLACKJACK_SETTINGS);

  return (
    <>
      <Button fullWidth mt="sm">
        Start Game
      </Button>
      <Button fullWidth mt="sm" variant="light" leftSection={<IconArrowsShuffle />}>
        Shuffle Deck
      </Button>
      <Divider my="md" />
      <Title order={2} mb="sm">
        Players
      </Title>
      <PlayerSelector
        game="BLACKJACK"
        playerElement={(index, player, blackjackPlayer) => {
          const [sidebetsOpen, setSidebetsOpen] = useState(false);

          if (!blackjackPlayer) return <></>;

          return (
            <Draggable key={player.id} index={index} draggableId={player.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={{
                    ...getStyle(provided.draggableProps.style, snapshot),
                    isDragging: snapshot.isDragging && !snapshot.isDropAnimating,
                    marginBottom: theme.spacing.sm,
                    opacity: snapshot.isDragging && !snapshot.isDropAnimating ? 0.65 : 1,
                  }}
                >
                  <Card withBorder radius="md">
                    <Group justify="space-between">
                      <div>
                        <Text size="lg" fw="bold">
                          {player.name}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {formatMoney(player.balance)}
                        </Text>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          width: "80%",
                        }}
                      >
                        <NumberInput radius="md" mx="sm" leftSection={<IconCurrencyDollar />} />
                        <ButtonGroup
                          style={{
                            width: "100%",
                          }}
                        >
                          <Button fullWidth variant="light">
                            +5
                          </Button>
                          <Button fullWidth variant="light">
                            X2
                          </Button>
                          <Button fullWidth variant="light">
                            1/2
                          </Button>
                          <Button fullWidth variant="light">
                            Max
                          </Button>
                          {(blackjackSettings.betBehindEnabled ||
                            blackjackSettings.perfectPairsEnabled ||
                            blackjackSettings.twentyOnePlusThreeEnabled) && (
                            <Button
                              fullWidth
                              variant="light"
                              onClick={() => setSidebetsOpen(!sidebetsOpen)}
                              color="green"
                            >
                              <IconChevronsDown size="1.25rem" />
                            </Button>
                          )}
                          <Button fullWidth variant="light" color="red">
                            <IconX size="1.25rem" />
                          </Button>
                        </ButtonGroup>
                      </div>
                    </Group>
                    <Collapse in={sidebetsOpen}>
                      <Divider my="xs" />
                      <Grid columns={amountOfSideBetsEnabled(blackjackSettings) * 12}>
                        {blackjackSettings.perfectPairsEnabled && (
                          <Grid.Col
                            span={
                              amountOfSideBetsEnabled(blackjackSettings) *
                              12 *
                              (blackjackSettings.betBehindEnabled
                                ? blackjackSettings.twentyOnePlusThreeEnabled
                                  ? 0.2
                                  : 0.4
                                : 1 / amountOfSideBetsEnabled(blackjackSettings))
                            }
                          >
                            <Group grow>
                              <NumberInput
                                label="Perfect Pairs"
                                radius="md"
                                decimalScale={2}
                                fixedDecimalScale
                                thousandSeparator=","
                                placeholder="0.00"
                                leftSection={<IconCurrencyDollar />}
                                allowNegative={false}
                              />
                            </Group>
                          </Grid.Col>
                        )}
                        {blackjackSettings.twentyOnePlusThreeEnabled && (
                          <Grid.Col
                            span={
                              amountOfSideBetsEnabled(blackjackSettings) *
                              12 *
                              (blackjackSettings.betBehindEnabled
                                ? blackjackSettings.perfectPairsEnabled
                                  ? 0.2
                                  : 0.4
                                : 1 / amountOfSideBetsEnabled(blackjackSettings))
                            }
                          >
                            <Group grow>
                              <NumberInput
                                label="21+3"
                                radius="md"
                                decimalScale={2}
                                fixedDecimalScale
                                thousandSeparator=","
                                placeholder="0.00"
                                leftSection={<IconCurrencyDollar />}
                                allowNegative={false}
                              />
                            </Group>
                          </Grid.Col>
                        )}
                        {blackjackSettings.betBehindEnabled && (
                          <Grid.Col
                            span={
                              amountOfSideBetsEnabled(blackjackSettings) *
                              12 *
                              (blackjackSettings.twentyOnePlusThreeEnabled &&
                              blackjackSettings.perfectPairsEnabled
                                ? 0.6
                                : amountOfSideBetsEnabled(blackjackSettings) == 1
                                ? 1
                                : 0.6)
                            }
                          >
                            <Group grow>
                              <Group grow>
                                <NumberInput
                                  label="Bet Behind Amount"
                                  radius="md"
                                  decimalScale={2}
                                  fixedDecimalScale
                                  thousandSeparator=","
                                  placeholder="0.00"
                                  leftSection={<IconCurrencyDollar />}
                                  allowNegative={false}
                                />
                              </Group>
                              <Select
                                label="Bet Behind Player"
                                radius="md"
                                leftSection={<IconUserSearch />}
                                leftSectionPointerEvents="none"
                                searchable
                                placeholder="Select Player"
                              />
                            </Group>
                          </Grid.Col>
                        )}
                      </Grid>
                    </Collapse>
                  </Card>
                </div>
              )}
            </Draggable>
          );
        }}
      />
    </>
  );
}

const amountOfSideBetsEnabled = (blackjackSettings: BlackjackSettings) => {
  let amount = 0;
  if (blackjackSettings.perfectPairsEnabled) amount++;
  if (blackjackSettings.twentyOnePlusThreeEnabled) amount++;
  if (blackjackSettings.betBehindEnabled) amount++;
  return amount;
};
