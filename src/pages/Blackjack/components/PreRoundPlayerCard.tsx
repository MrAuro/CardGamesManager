import GenericPlayerCard from "@/components/GenericPlayerCard";
import { BlackjackPlayer, BlackjackSettings } from "@/types/Blackjack";
import { Player } from "@/types/Player";
import { getPlayerErrors } from "@/utils/BlackjackHelper";
import { formatMoney } from "@/utils/MoneyHelper";
import {
  Group,
  NumberInput,
  ButtonGroup,
  Button,
  Collapse,
  Divider,
  Select,
  CloseButton,
  Combobox,
  useMantineTheme,
} from "@mantine/core";
import { IconCurrencyDollar, IconChevronsDown, IconX, IconUserSearch } from "@tabler/icons-react";

export default function PreRoundPlayerCard({
  player,
  blackjackPlayer,
  setBlackjackPlayers,
  index,
  blackjackSettings,
  sidebetsOpen,
  setSidebetsOpen,
  removePlayer,
  blackjackPlayers,
}: {
  player: Player;
  blackjackPlayer: BlackjackPlayer;
  setBlackjackPlayers: (callback: (draft: BlackjackPlayer[]) => void) => void;
  index: number;
  blackjackSettings: BlackjackSettings;
  sidebetsOpen: string[];
  setSidebetsOpen: (value: string[]) => void;
  blackjackPlayers: BlackjackPlayer[];
  removePlayer: (id: string) => void;
}) {
  const theme = useMantineTheme();

  return (
    <GenericPlayerCard
      header={player.name}
      subtext={formatMoney(player.balance)}
      key={player.id}
      rightSection={
        <Group justify="space-between">
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            <NumberInput
              radius="md"
              mx="sm"
              decimalScale={2}
              fixedDecimalScale
              thousandSeparator=","
              value={blackjackPlayer.bet}
              error={blackjackPlayer.errors.length > 0}
              leftSection={<IconCurrencyDollar />}
              onChange={(value) => {
                setBlackjackPlayers((draft) => {
                  draft[index].bet = Math.floor(parseFloat(`${value}`) * 100) / 100;

                  draft[index].errors = getPlayerErrors(player.balance, blackjackSettings, {
                    bet: draft[index].bet,
                    twentyOnePlusThree: draft[index].sidebets.twentyOnePlusThree,
                    perfectPairs: draft[index].sidebets.perfectPairs,
                    betBehindBet: draft[index].sidebets.betBehind.bet,
                    betBehindTarget: draft[index].sidebets.betBehind.target,
                  });
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

                    draft[index].errors = getPlayerErrors(player.balance, blackjackSettings, {
                      bet: draft[index].bet,
                      twentyOnePlusThree: draft[index].sidebets.twentyOnePlusThree,
                      perfectPairs: draft[index].sidebets.perfectPairs,
                      betBehindBet: draft[index].sidebets.betBehind.bet,
                      betBehindTarget: draft[index].sidebets.betBehind.target,
                    });
                  });
                }}
                style={{
                  backgroundColor:
                    blackjackPlayer.bet + 5 > player.balance ? theme.colors.dark[5] : undefined,
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

                    draft[index].errors = getPlayerErrors(player.balance, blackjackSettings, {
                      bet: draft[index].bet,
                      twentyOnePlusThree: draft[index].sidebets.twentyOnePlusThree,
                      perfectPairs: draft[index].sidebets.perfectPairs,
                      betBehindBet: draft[index].sidebets.betBehind.bet,
                      betBehindTarget: draft[index].sidebets.betBehind.target,
                    });
                  });
                }}
                style={{
                  backgroundColor:
                    blackjackPlayer.bet * 2 > player.balance ? theme.colors.dark[5] : undefined,
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

                    draft[index].errors = getPlayerErrors(player.balance, blackjackSettings, {
                      bet: draft[index].bet,
                      twentyOnePlusThree: draft[index].sidebets.twentyOnePlusThree,
                      perfectPairs: draft[index].sidebets.perfectPairs,
                      betBehindBet: draft[index].sidebets.betBehind.bet,
                      betBehindTarget: draft[index].sidebets.betBehind.target,
                    });
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

                    draft[index].errors = getPlayerErrors(player.balance, blackjackSettings, {
                      bet: draft[index].bet,
                      twentyOnePlusThree: draft[index].sidebets.twentyOnePlusThree,
                      perfectPairs: draft[index].sidebets.perfectPairs,
                      betBehindBet: draft[index].sidebets.betBehind.bet,
                      betBehindTarget: draft[index].sidebets.betBehind.target,
                    });
                  });
                }}
                style={{
                  backgroundColor:
                    blackjackPlayer.bet == player.balance ? theme.colors.dark[5] : undefined,
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
                  removePlayer(player.id);
                }}
              >
                <IconX size="1.25rem" />
              </Button>
            </ButtonGroup>
          </div>
        </Group>
      }
    >
      <Collapse in={sidebetsOpen.includes(player.id) || blackjackPlayer.errors.length > 0}>
        <Divider mt="xs" mb={5} />
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
                value={blackjackPlayer.sidebets.perfectPairs}
                error={blackjackPlayer.errors.length > 0}
                onChange={(value) => {
                  setBlackjackPlayers((draft) => {
                    draft[index].sidebets.perfectPairs =
                      Math.floor(parseFloat(`${value}`) * 100) / 100;

                    draft[index].errors = getPlayerErrors(player.balance, blackjackSettings, {
                      bet: draft[index].bet,
                      twentyOnePlusThree: draft[index].sidebets.twentyOnePlusThree,
                      perfectPairs: draft[index].sidebets.perfectPairs,
                      betBehindBet: draft[index].sidebets.betBehind.bet,
                      betBehindTarget: draft[index].sidebets.betBehind.target,
                    });
                  });
                }}
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
                value={blackjackPlayer.sidebets.twentyOnePlusThree}
                error={blackjackPlayer.errors.length > 0}
                onChange={(value) => {
                  setBlackjackPlayers((draft) => {
                    draft[index].sidebets.twentyOnePlusThree =
                      Math.floor(parseFloat(`${value}`) * 100) / 100;

                    draft[index].errors = getPlayerErrors(player.balance, blackjackSettings, {
                      bet: draft[index].bet,
                      twentyOnePlusThree: draft[index].sidebets.twentyOnePlusThree,
                      perfectPairs: draft[index].sidebets.perfectPairs,
                      betBehindBet: draft[index].sidebets.betBehind.bet,
                      betBehindTarget: draft[index].sidebets.betBehind.target,
                    });
                  });
                }}
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
                  value={blackjackPlayer.sidebets.betBehind.bet}
                  error={blackjackPlayer.errors.length > 0}
                  onChange={(value) => {
                    setBlackjackPlayers((draft) => {
                      draft[index].sidebets.betBehind.bet =
                        Math.floor(parseFloat(`${value}`) * 100) / 100;

                      draft[index].errors = getPlayerErrors(player.balance, blackjackSettings, {
                        bet: draft[index].bet,
                        twentyOnePlusThree: draft[index].sidebets.twentyOnePlusThree,
                        perfectPairs: draft[index].sidebets.perfectPairs,
                        betBehindBet: draft[index].sidebets.betBehind.bet,
                        betBehindTarget: draft[index].sidebets.betBehind.target,
                      });
                    });
                  }}
                />
              </Group>
              <Select
                label="Bet Behind Player"
                radius="md"
                leftSection={<IconUserSearch />}
                leftSectionPointerEvents="none"
                searchable
                placeholder="Select Player"
                value={blackjackPlayer.sidebets.betBehind.target || null}
                data={blackjackPlayers
                  .filter((p) => p.id !== player.id)
                  .map((p) => ({ label: p.displayName, value: p.id }))}
                error={blackjackPlayer.errors.length > 0}
                onChange={(value) => {
                  if (value === null) {
                    setBlackjackPlayers((draft) => {
                      draft[index].sidebets.betBehind.bet = 0;
                      draft[index].sidebets.betBehind.target = "";

                      draft[index].errors = getPlayerErrors(player.balance, blackjackSettings, {
                        bet: draft[index].bet,
                        twentyOnePlusThree: draft[index].sidebets.twentyOnePlusThree,
                        perfectPairs: draft[index].sidebets.perfectPairs,
                        betBehindBet: draft[index].sidebets.betBehind.bet,
                        betBehindTarget: draft[index].sidebets.betBehind.target,
                      });
                    });
                  } else {
                    setBlackjackPlayers((draft) => {
                      draft[index].sidebets.betBehind.target = value;

                      draft[index].errors = getPlayerErrors(player.balance, blackjackSettings, {
                        bet: draft[index].bet,
                        twentyOnePlusThree: draft[index].sidebets.twentyOnePlusThree,
                        perfectPairs: draft[index].sidebets.perfectPairs,
                        betBehindBet: draft[index].sidebets.betBehind.bet,
                        betBehindTarget: draft[index].sidebets.betBehind.target,
                      });
                    });
                  }
                }}
                rightSection={
                  blackjackPlayer.sidebets.betBehind.target ? (
                    <CloseButton
                      size="sm"
                      onClick={() => {
                        setBlackjackPlayers((draft) => {
                          draft[index].sidebets.betBehind.bet = 0;
                          draft[index].sidebets.betBehind.target = "";

                          draft[index].errors = getPlayerErrors(player.balance, blackjackSettings, {
                            bet: draft[index].bet,
                            twentyOnePlusThree: draft[index].sidebets.twentyOnePlusThree,
                            perfectPairs: draft[index].sidebets.perfectPairs,
                            betBehindBet: draft[index].sidebets.betBehind.bet,
                            betBehindTarget: draft[index].sidebets.betBehind.target,
                          });
                        });
                      }}
                    />
                  ) : (
                    <Combobox.Chevron />
                  )
                }
                rightSectionPointerEvents={
                  blackjackPlayer.sidebets.betBehind.target?.length ? "auto" : "none"
                }
              />
            </Group>
          )}
        </Group>
      </Collapse>
    </GenericPlayerCard>
  );
}
