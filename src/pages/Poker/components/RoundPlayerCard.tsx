import { PLAYERS_STATE, POKER_GAME_STATE, POKER_PLAYERS_STATE, POKER_SETTINGS_STATE } from "@/Root";
import GenericPlayerCard from "@/components/GenericPlayerCard";
import PlayingCard from "@/components/PlayingCard";
import { CARD_SELECTOR_STATE } from "@/pages/Blackjack/routes/Round";
import { Player } from "@/types/Player";
import { PokerPlayer } from "@/types/Poker";
import { formatMoney } from "@/utils/MoneyHelper";
import {
  Button,
  Container,
  Divider,
  Flex,
  Grid,
  Group,
  NumberInput,
  Text,
  Tooltip,
  darken,
  useMantineTheme,
} from "@mantine/core";
import { useRecoilState, useRecoilValue } from "recoil";
import { DealerBadge, SmallBlindBadge, BigBlindBadge, AllInBadge } from "../routes/PreRound";
import { useDisclosure, useScrollIntoView } from "@mantine/hooks";
import {
  IconCoin,
  IconCoins,
  IconCurrencyDollar,
  IconSum,
  IconTriangle,
  IconTriangleFilled,
  IconTrianglePlus,
  IconTrianglePlus2,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useRecoilImmerState } from "@/utils/RecoilImmer";

export default function RoundPlayerCard({
  player,
  pokerPlayer,
  active,
  checkAction,
  callAction,
  betAction,
  foldAction,
}: {
  player: Player;
  pokerPlayer: PokerPlayer;
  active: boolean;
  checkAction: () => void;
  callAction: () => void;
  betAction: (amount: number) => void;
  foldAction: () => void;
}) {
  const theme = useMantineTheme();
  const [cardSelector, setCardSelector] = useRecoilState(CARD_SELECTOR_STATE);
  const pokerGame = useRecoilValue(POKER_GAME_STATE);
  const pokerSettings = useRecoilValue(POKER_SETTINGS_STATE);
  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
    offset: 100,
    duration: 500,
  });

  useEffect(() => {
    if (active) {
      scrollIntoView({
        alignment: "center",
      });
    }
  }, [active]);

  const [foldConfirm, setFoldConfirm] = useState(false);
  const [allInConfirm, setAllInConfirm] = useState(false);
  const [timerStart, setTimerStart] = useState<number | null>(null);

  const [dateNow, setDateNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      if (foldConfirm || allInConfirm) {
        setDateNow(Date.now());
      }
    }, 5);

    return () => clearInterval(interval);
  }, [foldConfirm, allInConfirm]);

  const [betOrRaise, setBetOrRaise] = useState<"BET" | "RAISE">("BET");
  const [betOpened, betOpenedHandlers] = useDisclosure(false);
  const [bet, setBet] = useState(pokerGame.currentBet);
  const betInputRef = useRef<HTMLInputElement>(null);

  const [betError, setBetError] = useState<string | null>(null);
  useEffect(() => {
    if (bet < pokerGame.currentBet) {
      setBetError("Bet must be greater than the current bet");
      return;
    }

    setBetError(null);
  }, [bet]);

  const mustGoAllIn = pokerGame.currentBet - pokerPlayer.currentBet > player.balance;

  return (
    <div ref={targetRef}>
      <GenericPlayerCard
        header={
          <>
            <Flex align="center" mr="sm" gap="xs">
              <Text
                size="xl"
                c={pokerPlayer.folded ? "dimmed" : undefined}
                fw={pokerPlayer.folded ? 600 : "bold"}
                td={pokerPlayer.folded ? "line-through" : undefined}
              >
                {pokerPlayer.displayName}
              </Text>
              {pokerPlayer.allIn && <AllInBadge />}
              {pokerGame.currentDealer == player.id && <DealerBadge />}
              {pokerSettings.forcedBetOption == "BLINDS" &&
                pokerGame.currentSmallBlind == player.id && <SmallBlindBadge />}
              {pokerSettings.forcedBetOption == "BLINDS" &&
                pokerGame.currentBigBlind == player.id && <BigBlindBadge />}
            </Flex>
          </>
        }
        backgroundColor={active ? theme.colors.dark[6] : theme.colors.dark[7]}
        subsection={
          <>
            <Text size="md" fw={600}>
              {formatMoney(pokerPlayer.currentBet)}
            </Text>
            <Text size="sm" c="dimmed">
              {formatMoney(player.balance)}
            </Text>
          </>
        }
        rightSection={
          <>
            {pokerPlayer.cards.map((card, index) => (
              <Container p={0} m={0} pl="xs" key={`${card}-${index}`}>
                <PlayingCard
                  key={index}
                  card={card}
                  onClick={() => {
                    setCardSelector({
                      ...cardSelector,
                      intitalCard: card,
                      opened: true,
                      onSubmitTarget: pokerPlayer.id,
                      onSubmitIndex: index,
                    });
                  }}
                  disabled={active}
                />
              </Container>
            ))}
          </>
        }
      >
        <>
          <Divider my="xs" />
          {betOpened ? (
            <>
              <Group grow>
                <Grid columns={24}>
                  <Grid.Col span={9}>
                    <NumberInput
                      ref={betInputRef}
                      radius="md"
                      decimalScale={2}
                      fixedDecimalScale
                      thousandSeparator=","
                      placeholder="0.00"
                      error={betError}
                      leftSection={<IconCurrencyDollar />}
                      allowNegative={false}
                      value={bet}
                      onChange={(value) => {
                        setBet(parseFloat(`${value}`));
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col span={5}>
                    <Button
                      fullWidth
                      color="gray"
                      disabled={!active}
                      onClick={() => {
                        setBet(0);
                        betOpenedHandlers.close();
                      }}
                    >
                      Cancel
                    </Button>
                  </Grid.Col>
                  <Grid.Col span={5}>
                    <Button
                      fullWidth
                      color="red"
                      disabled={!active || pokerPlayer.currentBet == player.balance}
                      style={{
                        background: active
                          ? `linear-gradient(to left, ${theme.colors.red[8]} ${Math.min(
                              100,
                              ((dateNow - (timerStart || 0)) / 3000) * 100
                            )}%, ${theme.colors.red[9]} 0%)`
                          : undefined,
                      }}
                      leftSection={timerStart ? undefined : <IconTriangleFilled />}
                      onClick={() => {
                        if (allInConfirm) {
                          setBet(player.balance);
                          betAction(player.balance);
                          betOpenedHandlers.close();
                          setAllInConfirm(false);
                        } else {
                          setAllInConfirm(true);

                          // We wait 3 seconds to reset the all in confirm
                          setTimerStart(Date.now());
                          setTimeout(() => {
                            setAllInConfirm(false);
                            setTimerStart(null);
                          }, 3000);
                        }
                      }}
                    >
                      {allInConfirm
                        ? "Are you sure?"
                        : `All In (${formatMoney(player.balance, true, true)})`}
                    </Button>
                  </Grid.Col>
                  <Grid.Col span={5}>
                    <Button
                      fullWidth
                      color="blue"
                      disabled={!active || betError != null}
                      onClick={() => {
                        betAction(bet);
                        betOpenedHandlers.close();
                      }}
                    >
                      {betOrRaise == "BET" ? "Bet" : "Raise to"} {formatMoney(bet, true, false)}
                    </Button>
                  </Grid.Col>
                </Grid>
              </Group>
            </>
          ) : (
            <Group grow>
              {pokerGame.currentBet > pokerPlayer.currentBet && (
                <Button fullWidth color="green" disabled={!active} onClick={callAction}>
                  Call{" "}
                  {mustGoAllIn
                    ? `${formatMoney(player.balance)} (All In)`
                    : formatMoney(
                        Math.min(pokerGame.currentBet - pokerPlayer.currentBet, player.balance),
                        true,
                        true
                      )}
                </Button>
              )}
              {pokerGame.currentBet <= pokerPlayer.currentBet && (
                <Button fullWidth color="green" disabled={!active} onClick={checkAction}>
                  Check
                </Button>
              )}
              <Button
                fullWidth
                color="red"
                disabled={!active}
                style={{
                  // Make the background like a progress bar, showing how long until the fold confirm is reset
                  background: active
                    ? `linear-gradient(to left, ${theme.colors.red[8]} ${Math.min(
                        100,
                        ((dateNow - (timerStart || 0)) / 3000) * 100
                      )}%, ${theme.colors.red[9]} 0%)`
                    : undefined,
                }}
                onClick={() => {
                  if (foldConfirm) {
                    foldAction();
                    setFoldConfirm(false);
                    return;
                  } else {
                    setFoldConfirm(true);

                    // We wait 3 seconds to reset the fold confirm
                    setTimerStart(Date.now());
                    setTimeout(() => {
                      setFoldConfirm(false);
                      setTimerStart(null);
                    }, 3000);
                  }
                }}
              >
                {foldConfirm ? "Are you sure?" : "Fold"}
              </Button>
              {pokerGame.currentBet > 0 && (
                <Button
                  fullWidth
                  color="blue"
                  disabled={!active || pokerPlayer.allIn}
                  onClick={() => {
                    setBetOrRaise("RAISE");
                    betOpenedHandlers.open();

                    // Focus and go to the beginning of the input
                    // We wait 100ms to make sure the input is rendered
                    setTimeout(() => {
                      betInputRef.current?.focus();
                      betInputRef.current?.setSelectionRange(0, 0);
                    }, 100);
                  }}
                >
                  Raise
                </Button>
              )}
              {pokerGame.currentBet == 0 && (
                <Button
                  fullWidth
                  color="blue"
                  disabled={!active || pokerPlayer.allIn}
                  onClick={() => {
                    setBetOrRaise("BET");
                    betOpenedHandlers.open();

                    // Focus and go to the beginning of the input
                    // We wait 100ms to make sure the input is rendered
                    setTimeout(() => {
                      betInputRef.current?.focus();
                      betInputRef.current?.setSelectionRange(0, 0);
                    }, 100);
                  }}
                >
                  Bet
                </Button>
              )}
            </Group>
          )}
        </>
      </GenericPlayerCard>
    </div>
  );
}
