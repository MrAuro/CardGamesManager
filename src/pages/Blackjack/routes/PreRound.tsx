import { BLACKJACK_PLAYERS_STATE, BLACKJACK_SETTINGS } from "@/Root";
import PlayerSelector from "@/components/PlayerSelector";
import { formatMoney } from "@/utils/MoneyHelper";
import { useRecoilImmerState } from "@/utils/RecoilImmer";
import { Draggable, DraggableStateSnapshot } from "@hello-pangea/dnd";
import {
  Button,
  ButtonGroup,
  Card,
  Collapse,
  Divider,
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
  const [blackjackPlayers, setBlackjackPlayers] = useRecoilImmerState(BLACKJACK_PLAYERS_STATE);

  const [sidebetsOpen, setSidebetsOpen] = useState<string[]>([]);

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
          if (!blackjackPlayer) return <></>;

          return (
            <Draggable key={player.id} index={index} draggableId={player.id}>
              {(provided, snapshot) => (
                <div
                  key={player.id}
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
                  <Card withBorder radius="md" p="sm">
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
                        <NumberInput
                          radius="md"
                          mx="sm"
                          decimalScale={2}
                          fixedDecimalScale
                          thousandSeparator=","
                          value={blackjackPlayer.bet}
                          leftSection={<IconCurrencyDollar />}
                          onChange={(value) => {
                            setBlackjackPlayers((draft) => {
                              draft[index].bet = Math.floor(parseFloat(`${value}`) * 100) / 100;
                              console.log(draft[index].bet, value);
                            });
                          }}
                        />
                        <ButtonGroup
                          style={{
                            width: "100%",
                          }}
                        >
                          <Button
                            fullWidth
                            variant="light"
                            disabled={blackjackPlayer.bet + 5 > player.balance}
                            onClick={() => {
                              setBlackjackPlayers((draft) => {
                                draft[index].bet = Math.floor((draft[index].bet + 5) * 100) / 100;
                              });
                            }}
                            style={{
                              backgroundColor:
                                blackjackPlayer.bet + 5 > player.balance
                                  ? theme.colors.dark[5]
                                  : undefined,
                            }}
                          >
                            +5
                          </Button>
                          <Button
                            fullWidth
                            variant="light"
                            disabled={blackjackPlayer.bet * 2 > player.balance}
                            onClick={() => {
                              setBlackjackPlayers((draft) => {
                                draft[index].bet = Math.floor(draft[index].bet * 2 * 100) / 100;
                              });
                            }}
                            style={{
                              backgroundColor:
                                blackjackPlayer.bet * 2 > player.balance
                                  ? theme.colors.dark[5]
                                  : undefined,
                            }}
                          >
                            X2
                          </Button>
                          <Button
                            fullWidth
                            variant="light"
                            disabled={Math.floor((blackjackPlayer.bet * 100) / 2) == 0}
                            onClick={() => {
                              setBlackjackPlayers((draft) => {
                                draft[index].bet = Math.floor((draft[index].bet / 2) * 100) / 100;
                              });
                            }}
                            style={{
                              backgroundColor:
                                Math.floor((blackjackPlayer.bet * 100) / 2) == 0
                                  ? theme.colors.dark[5]
                                  : undefined,
                            }}
                          >
                            1/2
                          </Button>
                          <Button
                            fullWidth
                            variant="light"
                            disabled={blackjackPlayer.bet == player.balance}
                            onClick={() => {
                              setBlackjackPlayers((draft) => {
                                draft[index].bet = Math.floor(player.balance * 100) / 100;
                              });
                            }}
                            style={{
                              backgroundColor:
                                blackjackPlayer.bet == player.balance
                                  ? theme.colors.dark[5]
                                  : undefined,
                            }}
                          >
                            Max
                          </Button>
                          {(blackjackSettings.betBehindEnabled ||
                            blackjackSettings.perfectPairsEnabled ||
                            blackjackSettings.twentyOnePlusThreeEnabled) && (
                            <Button
                              fullWidth
                              variant="light"
                              onClick={() => {
                                if (sidebetsOpen.includes(player.id)) {
                                  setSidebetsOpen(sidebetsOpen.filter((id) => id !== player.id));
                                } else {
                                  setSidebetsOpen([...sidebetsOpen, player.id]);
                                }
                              }}
                              color="green"
                            >
                              {sidebetsOpen.includes(player.id) ? (
                                <IconChevronsDown
                                  size="1.25rem"
                                  style={{
                                    transform: "rotate(180deg)",
                                    transition: "transform 0.3s ease",
                                  }}
                                />
                              ) : (
                                <IconChevronsDown
                                  size="1.25rem"
                                  style={{
                                    transform: "rotate(0deg)",
                                    transition: "transform 0.3s ease",
                                  }}
                                />
                              )}
                            </Button>
                          )}
                          <Button
                            fullWidth
                            variant="light"
                            color="red"
                            onClick={() => {
                              setBlackjackPlayers((draft) => {
                                draft.splice(index, 1);
                              });
                            }}
                          >
                            <IconX size="1.25rem" />
                          </Button>
                        </ButtonGroup>
                      </div>
                    </Group>
                    <Collapse in={sidebetsOpen.includes(player.id)}>
                      <Divider mt={5} mb={5} />
                      <Group grow preventGrowOverflow={false} wrap="nowrap">
                        {blackjackSettings.perfectPairsEnabled && (
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
                        )}
                        {blackjackSettings.twentyOnePlusThreeEnabled && (
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
                        )}
                        {blackjackSettings.betBehindEnabled && (
                          <Group grow>
                            <Group>
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
                        )}
                      </Group>
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
