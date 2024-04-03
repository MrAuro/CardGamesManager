import { POKER_GAME_STATE, POKER_SETTINGS_STATE } from "@/Root";
import GenericPlayerCard from "@/components/GenericPlayerCard";
import PlayingCard from "@/components/PlayingCard";
import { CARD_SELECTOR_STATE } from "@/pages/Blackjack/routes/Round";
import { Player } from "@/types/Player";
import { PokerPlayer } from "@/types/Poker";
import { isAnyEmpty } from "@/utils/CardHelper";
import { formatMoney } from "@/utils/MoneyHelper";
import { rankingToName } from "@/utils/PokerHelper";
import {
  Badge,
  Button,
  Container,
  Divider,
  Flex,
  Grid,
  Group,
  NumberInput,
  Paper,
  Text,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useScrollIntoView } from "@mantine/hooks";
import { IconCurrencyDollar, IconTriangleFilled } from "@tabler/icons-react";
import { forwardRef, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { AllInBadge, BigBlindBadge, DealerBadge, SmallBlindBadge } from "../routes/PreRound";
import {
  ALLIN_CONFIRM,
  BETUI_OPEN,
  FOLD_CONFIRM,
  PLAYER_BET,
  PLAYER_HAND_RESULTS,
  TIMER_START,
} from "../routes/Round";

type RoundPlayerCardProps = {
  player: Player;
  pokerPlayer: PokerPlayer;
  active: boolean;
  checkAction: () => void;
  callAction: () => void;
  betAction: (amount: number) => void;
  foldAction: () => void;
};

const RoundPlayerCard = forwardRef(
  (
    {
      player,
      pokerPlayer,
      active,
      checkAction,
      callAction,
      betAction,
      foldAction,
    }: RoundPlayerCardProps,
    ref
  ) => {
    const theme = useMantineTheme();
    const [cardSelector, setCardSelector] = useRecoilState(CARD_SELECTOR_STATE);
    const pokerGame = useRecoilValue(POKER_GAME_STATE);
    const pokerSettings = useRecoilValue(POKER_SETTINGS_STATE);
    const handResult = useRecoilValue(PLAYER_HAND_RESULTS)?.find(
      (result) => result.id == pokerPlayer.id
    );
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

    const [foldConfirm, setFoldConfirm] = useRecoilState(FOLD_CONFIRM);
    const [allInConfirm, setAllInConfirm] = useRecoilState(ALLIN_CONFIRM);
    const [timerStart, setTimerStart] = useRecoilState(TIMER_START);

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
    const [betOpened, setBetOpened] = useRecoilState(BETUI_OPEN);
    const [bet, setBet] = useRecoilState(PLAYER_BET);

    const [betError, setBetError] = useState<string | null>(null);
    useEffect(() => {
      if (isNaN(bet)) {
        setBet(0);
      }

      if (bet < pokerGame.currentBet) {
        setBetError("Bet must be greater than the current bet");
        return;
      }

      setBetError(null);
    }, [bet]);

    useEffect(() => {
      if (active) {
        setBet(pokerGame.currentBet);
      } else {
        setBetOpened(false);
      }
    }, [active]);

    const mustGoAllIn = pokerGame.currentBet - pokerPlayer.currentBet > player.balance;

    return (
      <div ref={targetRef}>
        <GenericPlayerCard
          header={
            <>
              <Flex align="center" mr="sm" gap="xs">
                <Tooltip label={pokerPlayer.id} openDelay={1000}>
                  <Text
                    size="xl"
                    c={pokerPlayer.folded ? "dimmed" : undefined}
                    fw={pokerPlayer.folded ? 600 : "bold"}
                  >
                    {pokerPlayer.displayName}
                  </Text>
                </Tooltip>
                {pokerPlayer.allIn && <AllInBadge />}
                {pokerGame.currentDealer == player.id && <DealerBadge />}
                {(pokerSettings.forcedBetOption == "BLINDS" ||
                  pokerSettings.forcedBetOption == "BLINDS+ANTE") &&
                  pokerGame.currentSmallBlind == player.id && <SmallBlindBadge />}
                {(pokerSettings.forcedBetOption == "BLINDS" ||
                  pokerSettings.forcedBetOption == "BLINDS+ANTE") &&
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
              <Paper
                style={{
                  width: "10rem",
                  height: "4.5rem",
                  backgroundColor: "transparent",
                }}
              >
                <Flex direction="column" align="center" justify="center" style={{ height: "100%" }}>
                  <Text fw="bold" ta="center" style={{}}>
                    {rankingToName(handResult?.result.handRank || "")}
                  </Text>
                  {pokerGame.communityCards.filter((card) => isAnyEmpty(card)).length != 0 && (
                    <Text c="dimmed" size="sm" ta="center" style={{}}>
                      <>{handResult?.result.winPercentage}</>
                    </Text>
                  )}
                  {handResult?.result.win == 1 && <Badge color="yellow">Winner</Badge>}
                  {handResult?.result.ties == 1 && (
                    <Badge
                      mt="xs"
                      color="gray.7"
                      styles={{
                        label: {
                          color: "white",
                        },
                      }}
                    >
                      Tie
                    </Badge>
                  )}
                </Flex>
              </Paper>
              {pokerPlayer.cards.map((card, index) => (
                <Container p={0} m={0} pl="xs" key={`${card}-${index}`}>
                  <PlayingCard
                    strict
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
                    disabled={active || (pokerGame.gameState == "SHOWDOWN" && !pokerPlayer.folded)}
                  />
                </Container>
              ))}
            </>
          }
        >
          {pokerGame.gameState == "SHOWDOWN" && !pokerPlayer.folded ? (
            <>{/* Add additional information here if needed */}</>
          ) : (
            <>
              <Divider my="xs" />
              {betOpened && active ? (
                <>
                  <Group grow>
                    <Grid columns={24}>
                      <Grid.Col span={9}>
                        <NumberInput
                          ref={ref as any}
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
                            setBetOpened(false);
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
                            if (allInConfirm && active) {
                              setBet(player.balance);
                              betAction(player.balance);
                              setBetOpened(false);
                              setAllInConfirm(false);
                              setTimerStart(null);
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
                          {allInConfirm && active
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
                            setBetOpened(false);
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
                      if (foldConfirm && active) {
                        foldAction();
                        setFoldConfirm(false);
                        setTimerStart(null);
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
                    {foldConfirm && active ? "Are you sure?" : "Fold"}
                  </Button>
                  {pokerGame.currentBet > 0 && (
                    <Button
                      fullWidth
                      color="blue"
                      disabled={!active || pokerPlayer.allIn}
                      onClick={() => {
                        setBetOrRaise("RAISE");
                        setBetOpened(true);

                        // Focus and go to the beginning of the input
                        // We wait 100ms to make sure the input is rendered
                        setTimeout(() => {
                          (ref as any).current?.focus();
                          (ref as any).current?.setSelectionRange(0, 9999);
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
                        setBetOpened(true);

                        // Focus and go to the beginning of the input
                        // We wait 100ms to make sure the input is rendered
                        setTimeout(() => {
                          (ref as any).current?.focus();
                          (ref as any).current?.setSelectionRange(0, 9999);
                        }, 100);
                      }}
                    >
                      Bet
                    </Button>
                  )}
                </Group>
              )}
            </>
          )}
        </GenericPlayerCard>
      </div>
    );
  }
);

export default RoundPlayerCard;
