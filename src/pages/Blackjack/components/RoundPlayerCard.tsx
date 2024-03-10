import { BLACKJACK_PLAYERS_STATE, BLACKJACK_SETTINGS, PLAYERS_STATE } from "@/Root";
import GenericPlayerCard from "@/components/GenericPlayerCard";
import PlayingCard from "@/components/PlayingCard";
import { BlackjackPlayer } from "@/types/Blackjack";
import { Player } from "@/types/Player";
import {
  findPerfectPairs,
  findTwentyOnePlusThree,
  getCardTotal,
  getCardValue,
} from "@/utils/BlackjackHelper";
import { EMPTY_CARD } from "@/utils/CardHelper";
import { formatMoney } from "@/utils/MoneyHelper";
import { useRecoilImmerState } from "@/utils/RecoilImmer";
import {
  Button,
  Container,
  Divider,
  Group,
  Paper,
  Text,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { useRecoilState, useRecoilValue } from "recoil";
import { CARD_SELECTOR_STATE } from "../routes/Round";

export default function RoundPlayerCard({
  player,
  blackjackPlayer,
  isActive,
  nextTurn,
  forceTurn,
}: {
  player: Player;
  blackjackPlayer: BlackjackPlayer;
  isActive: boolean;
  nextTurn: () => void;
  forceTurn: (playerId: string) => void;
}) {
  const [cardSelector, setCardSelector] = useRecoilState(CARD_SELECTOR_STATE);
  const [blackjackPlayers, setBlackjackPlayers] = useRecoilImmerState(BLACKJACK_PLAYERS_STATE);
  const blackjackSettings = useRecoilValue(BLACKJACK_SETTINGS);
  const [players, setPlayers] = useRecoilImmerState(PLAYERS_STATE);
  const theme = useMantineTheme();

  const calculatedCardResult = getCardTotal(blackjackPlayer.cards);

  const calculatedPerfectPairs = blackjackPlayer.sidebets.perfectPairs
    ? findPerfectPairs(blackjackPlayer.cards)
    : null;

  let perfectPairEarnings = -blackjackPlayer.sidebets.perfectPairs;
  switch (calculatedPerfectPairs) {
    case "None":
      break;

    case "Mixed":
      perfectPairEarnings =
        blackjackPlayer.sidebets.perfectPairs * blackjackSettings.perfectPairsMixedPayout;
      break;

    case "Colored":
      perfectPairEarnings =
        blackjackPlayer.sidebets.perfectPairs * blackjackSettings.perfectPairsColoredPayout;
      break;

    case "Perfect":
      perfectPairEarnings =
        blackjackPlayer.sidebets.perfectPairs * blackjackSettings.perfectPairsSuitedPayout;
      break;
  }

  const calculatedTwentyOnePlusThree = blackjackPlayer.sidebets.twentyOnePlusThree
    ? findTwentyOnePlusThree(blackjackPlayer.cards)
    : null;

  return (
    <GenericPlayerCard
      header={blackjackPlayer.displayName}
      backgroundColor={isActive ? theme.colors.dark[6] : theme.colors.dark[7]}
      subsection={
        <>
          <Text size="md" fw={600}>
            {formatMoney(blackjackPlayer.bet)} {blackjackPlayer.doubledDown ? "(X2)" : ""}{" "}
            {blackjackPlayer.split ? "(Split)" : ""}
          </Text>
          <Text size="sm" c="dimmed">
            {formatMoney(player.balance)}
          </Text>
        </>
      }
      rightSection={
        <>
          {calculatedPerfectPairs && (
            <Paper
              style={{
                width: "4.5rem",
                height: "4.5rem",
                backgroundColor: "transparent",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                }}
              >
                <Text size="xs" c="dimmed" fw={600} tt="capitalize" ta="center">
                  Perfect Pairs
                </Text>
                {blackjackPlayer.cards.filter((card) => card != EMPTY_CARD).length > 0 ? (
                  <>
                    <Text size="md" fw="bold" ta="center">
                      {calculatedPerfectPairs}
                    </Text>
                    <Text
                      size="sm"
                      fw={600}
                      ta="center"
                      c={perfectPairEarnings <= 0 ? "red" : "green"}
                    >
                      {perfectPairEarnings > 0 && "+"}
                      {formatMoney(perfectPairEarnings)}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text size="md" fw="bold" ta="center">
                      Pending
                    </Text>
                    <Text size="sm" fw={600} ta="center" c="dimmed">
                      {formatMoney(blackjackPlayer.sidebets.perfectPairs)}
                    </Text>
                  </>
                )}
              </div>
            </Paper>
          )}
          <Paper
            style={{
              width: "4.5rem",
              height: "4.5rem",
              backgroundColor: "transparent",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <Text size={rem(14)} fw={600} tt="uppercase" ta="center">
                {calculatedCardResult.ace !== "NONE" ? calculatedCardResult.ace : ""}
              </Text>
              <Text size={rem(30)} fw="bold" ta="center">
                {calculatedCardResult.total}
              </Text>
            </div>
          </Paper>
          {blackjackPlayer.cards.map((card, index) => (
            <Container p={0} m={0} pl="xs" key={`${card}-${index}`}>
              <PlayingCard
                key={index}
                card={card}
                onClick={() => {
                  setCardSelector({
                    ...cardSelector,
                    intitalCard: card,
                    opened: true,
                    onSubmitTarget: blackjackPlayer.id,
                    onSubmitIndex: index,
                  });
                }}
                disabled={isActive}
              />
            </Container>
          ))}
        </>
      }
    >
      <Divider my="xs" />
      <Group grow>
        <Button
          disabled={
            !isActive ||
            blackjackPlayer.doubledDown ||
            blackjackPlayer.cards.some((card) => card == EMPTY_CARD)
          }
          fullWidth
          onClick={() => {
            setBlackjackPlayers((draft) => {
              draft.map((player) => {
                if (player.id == blackjackPlayer.id) {
                  if (!player.cards.some((card) => card == EMPTY_CARD)) {
                    player.cards.push(EMPTY_CARD);
                  }
                }
              });
            });
          }}
        >
          Hit
        </Button>
        <Button disabled={!isActive} fullWidth color="green" onClick={nextTurn}>
          Stand
        </Button>
        <Button
          disabled={
            !isActive || blackjackPlayer.doubledDown || player.balance < blackjackPlayer.bet
          }
          fullWidth
          color="red"
          onClick={() => {
            setBlackjackPlayers((draft) => {
              draft.map((player) => {
                if (player.id == blackjackPlayer.id) {
                  player.doubledDown = true;
                  player.cards.push(EMPTY_CARD);
                }
              });
            });

            setPlayers((draft) => {
              draft.map((player) => {
                if (player.id == blackjackPlayer.id) {
                  player.balance -= blackjackPlayer.bet;
                }
              });
            });
          }}
        >
          Double
        </Button>
        <Button
          disabled={
            !isActive ||
            blackjackPlayer.cards.length != 2 ||
            getCardValue(blackjackPlayer.cards[0]) != getCardValue(blackjackPlayer.cards[1])
          }
          fullWidth
          color="grape"
          onClick={() => {}}
        >
          Split
        </Button>
        <Button
          disabled={isActive}
          fullWidth
          color="gray"
          onClick={() => {
            forceTurn(blackjackPlayer.id);
          }}
        >
          Force Turn
        </Button>
      </Group>
    </GenericPlayerCard>
  );
}
