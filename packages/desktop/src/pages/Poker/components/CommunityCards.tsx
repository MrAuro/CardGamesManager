import { POKER_GAME_STATE, POKER_PLAYERS_STATE, POKER_SETTINGS_STATE } from "@/Root";
import PlayingCard from "@/components/PlayingCard";
import { CARD_SELECTOR_STATE } from "@/pages/Blackjack/routes/Round";
import { isAnyEmpty } from "@/utils/CardHelper";
import { formatMoney } from "@/utils/MoneyHelper";
import { Button, Card, Divider, Flex, Text, Title, useMantineTheme } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRecoilState, useRecoilValue } from "recoil";

export default function CommunityCards({
  cardsAllowed,
  distributePot,
}: {
  cardsAllowed: number;
  distributePot: () => void;
}) {
  const theme = useMantineTheme();
  const [pokerGame, setPokerGame] = useRecoilState(POKER_GAME_STATE);
  const pokerSettings = useRecoilValue(POKER_SETTINGS_STATE);
  const pokerPlayers = useRecoilValue(POKER_PLAYERS_STATE);
  const [cardSelector, setCardSelector] = useRecoilState(CARD_SELECTOR_STATE);

  let totalAmountToBePutInPot = 0;
  for (const [_, v] of Object.entries(pokerGame.currentBets)) {
    totalAmountToBePutInPot += v.amount;
  }

  if (pokerGame.gameState == "PREFLOP") {
    if (
      pokerSettings.forcedBetOption === "BLINDS" ||
      pokerSettings.forcedBetOption === "BLINDS+ANTE"
    ) {
      totalAmountToBePutInPot -= pokerSettings.bigBlind;
      totalAmountToBePutInPot -= pokerSettings.smallBlind;
    }

    if (
      pokerSettings.forcedBetOption === "ANTE" ||
      pokerSettings.forcedBetOption === "BLINDS+ANTE"
    ) {
      totalAmountToBePutInPot -= pokerSettings.ante * pokerPlayers.length;
    }
  }

  return (
    <Card
      withBorder
      radius="md"
      pt="xs"
      pb="xs"
      style={{
        backgroundColor: pokerGame.capturingCommunityCards
          ? theme.colors.dark[6]
          : theme.colors.dark[7],
      }}
    >
      <Title order={3} ta="center">
        Community Cards
      </Title>
      {pokerGame.pots.map((pot, index) => {
        return (
          <Text size="sm" fw={500} ta="center" key={index}>
            {pokerGame.pots.length > 0 ? (index == 0 ? "Main Pot" : `Sidepot #${index}`) : "Pot"}:{" "}
            {formatMoney(pot.amount)}
          </Text>
        );
      })}
      <Text c="dimmed" size="sm" ta="center" fw={500}>
        {formatMoney(totalAmountToBePutInPot)} pending
      </Text>
      <Text c="dimmed" size="xs" ta="center" tt="uppercase">
        {pokerGame.gameState}
      </Text>
      <Divider my="xs" />
      <Flex justify="center" gap="sm" align="center">
        {pokerGame.communityCards.map((card, index) => {
          return (
            <PlayingCard
              highContrast
              strict
              key={index}
              card={card}
              onClick={() => {
                setCardSelector({
                  ...cardSelector,
                  intitalCard: card,
                  opened: true,
                  onSubmitTarget: "COMMUNITY_CARDS",
                  onSubmitIndex: index,
                });
              }}
              disabled={!(cardsAllowed <= index)}
            />
          );
        })}
      </Flex>
      <Flex justify="center" gap="sm" align="center" mt="xs">
        <Button
          fullWidth
          disabled={!pokerGame.capturingCommunityCards}
          onClick={() => {
            if (
              pokerGame.communityCards.filter((card) => !isAnyEmpty(card)).length < cardsAllowed
            ) {
              notifications.show({
                message: "You must add all possible community cards",
                color: "red",
              });
              return;
            }

            setPokerGame({
              ...pokerGame,
              capturingCommunityCards: false,
            });
          }}
        >
          Save Cards
        </Button>
        <Button
          fullWidth
          disabled={pokerGame.capturingCommunityCards}
          style={{
            backgroundColor: pokerGame.capturingCommunityCards ? theme.colors.dark[5] : undefined,
          }}
          onClick={() => {
            setPokerGame({
              ...pokerGame,
              capturingCommunityCards: true,
            });
          }}
        >
          Focus
        </Button>
        <Button
          color="green"
          fullWidth
          onClick={distributePot}
          disabled={pokerGame.gameState !== "SHOWDOWN"}
        >
          Distribute Pots
        </Button>
      </Flex>
    </Card>
  );
}
