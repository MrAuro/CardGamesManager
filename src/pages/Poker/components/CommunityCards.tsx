import { POKER_GAME_STATE } from "@/Root";
import PlayingCard from "@/components/PlayingCard";
import { CARD_SELECTOR_STATE } from "@/pages/Blackjack/routes/Round";
import { isAnyEmpty } from "@/utils/CardHelper";
import { formatMoney } from "@/utils/MoneyHelper";
import { Button, Card, Center, Divider, Flex, Text, Title, useMantineTheme } from "@mantine/core";
import { useRecoilState } from "recoil";

export default function CommunityCards() {
  const theme = useMantineTheme();
  const [pokerGame, setPokerGame] = useRecoilState(POKER_GAME_STATE);
  const [cardSelector, setCardSelector] = useRecoilState(CARD_SELECTOR_STATE);

  let totalAmountToBePutInPot = 0;
  for (const [_, v] of Object.entries(pokerGame.currentBets)) {
    totalAmountToBePutInPot += v.amount;
  }

  let cardsAllowed = 0;
  switch (pokerGame.gameState) {
    case "PREFLOP":
      cardsAllowed = 0;
      break;

    case "FLOP":
      cardsAllowed = 3;
      break;

    case "TURN":
      cardsAllowed = 4;
      break;

    case "RIVER":
    case "SHOWDOWN":
      cardsAllowed = 5;
      break;
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
        Community Cards ({pokerGame.gameState}) (
        {pokerGame.capturingCommunityCards ? "Capturing" : "Not Capturing"})
      </Title>
      <Text size="sm" ta="center" fw={500}>
        {pokerGame.pots.map((pot, index) => {
          return `${
            pokerGame.pots.length > 0 ? (index == 0 ? "Main Pot" : `Pot #${index}`) : "Pot"
          }: ${formatMoney(pot.amount)}`;
        })}
      </Text>
      <Text size="sm" ta="center" fw={500}>
        {formatMoney(totalAmountToBePutInPot)} to be put in the pot
      </Text>
      <Divider my="xs" />
      <Flex justify="center" gap="sm" align="center">
        {pokerGame.communityCards.map((card, index) => {
          return (
            <PlayingCard
              highContrast
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
      <Center>
        <Button
          mt="xs"
          w="10rem"
          disabled={
            !pokerGame.capturingCommunityCards ||
            pokerGame.communityCards.filter((card) => !isAnyEmpty(card)).length < cardsAllowed
          }
          style={{
            backgroundColor:
              pokerGame.communityCards.filter((card) => !isAnyEmpty(card)).length < cardsAllowed
                ? theme.colors.dark[5]
                : undefined,
          }}
          onClick={() => {
            setPokerGame({
              ...pokerGame,
              capturingCommunityCards: false,
            });
          }}
        >
          Save Cards
        </Button>
      </Center>
    </Card>
  );
}
