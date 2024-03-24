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
  useMantineTheme,
} from "@mantine/core";
import { useRecoilState, useRecoilValue } from "recoil";
import { DealerBadge, SmallBlindBadge, BigBlindBadge } from "../routes/PreRound";
import { useDisclosure } from "@mantine/hooks";
import {
  IconCurrencyDollar,
  IconTriangle,
  IconTriangleFilled,
  IconTrianglePlus,
  IconTrianglePlus2,
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useRecoilImmerState } from "@/utils/RecoilImmer";

export default function RoundPlayerCard({
  player,
  pokerPlayer,
  active,
  checkAction,
  callAction,
}: {
  player: Player;
  pokerPlayer: PokerPlayer;
  active: boolean;
  checkAction: () => void;
  callAction: () => void;
}) {
  const theme = useMantineTheme();
  const [cardSelector, setCardSelector] = useRecoilState(CARD_SELECTOR_STATE);
  const pokerGame = useRecoilValue(POKER_GAME_STATE);
  const pokerSettings = useRecoilValue(POKER_SETTINGS_STATE);

  const [betOpened, betOpenedHandlers] = useDisclosure(false);
  const [bet, setBet] = useState(0);
  const betInputRef = useRef<HTMLInputElement>(null);

  return (
    <GenericPlayerCard
      header={
        <>
          <Flex align="center" mr="sm" gap="xs">
            <Text size="xl" fw="bold">
              {pokerPlayer.displayName}
            </Text>
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
                    leftSection={<IconCurrencyDollar />}
                    allowNegative={false}
                    value={bet}
                    onChange={(value) => {
                      setBet(parseFloat(`${value}`));
                    }}
                    onFocus={(event) => {
                      console.log("focus", event);
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
                    disabled={!active}
                    leftSection={<IconTriangleFilled />}
                  >
                    All In ({formatMoney(player.balance, true, true)})
                  </Button>
                </Grid.Col>
                <Grid.Col span={5}>
                  <Button fullWidth color="blue" disabled={!active}>
                    Bet {formatMoney(0, true, true)}
                  </Button>
                </Grid.Col>
              </Grid>
            </Group>
          </>
        ) : (
          <Group grow>
            {pokerGame.currentBet > pokerPlayer.currentBet && (
              <Button fullWidth color="green" disabled={!active} onClick={callAction}>
                Call {formatMoney(pokerGame.currentBet - pokerPlayer.currentBet, true, true)}
              </Button>
            )}
            {pokerGame.currentBet == pokerPlayer.currentBet && (
              <Button fullWidth color="green" disabled={!active} onClick={checkAction}>
                Check
              </Button>
            )}
            <Button fullWidth color="red" disabled={!active}>
              Fold
            </Button>
            {pokerGame.currentBet > pokerPlayer.currentBet && (
              <Button fullWidth color="blue" disabled={!active}>
                Raise
              </Button>
            )}
            {pokerGame.currentBet == pokerPlayer.currentBet && (
              <Button
                fullWidth
                color="blue"
                disabled={!active}
                onClick={() => {
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
  );
}
