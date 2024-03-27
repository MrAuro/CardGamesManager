import { POKER_GAME_STATE, POKER_PLAYERS_STATE } from "@/Root";
import PlayingCard from "@/components/PlayingCard";
import { formatMoney } from "@/utils/MoneyHelper";
import { Card, Divider, Flex, Text, Title, useMantineTheme } from "@mantine/core";
import { useRecoilValue } from "recoil";

export default function CommunityCards() {
  const theme = useMantineTheme();
  const pokerGame = useRecoilValue(POKER_GAME_STATE);
  const pokerPlayers = useRecoilValue(POKER_PLAYERS_STATE);

  let temp: string[] = [];

  let totalAmountToBePutInPot = 0;
  for (const [k, v] of Object.entries(pokerGame.currentBets)) {
    totalAmountToBePutInPot += v.amount;
  }

  return (
    <Card
      withBorder
      radius="md"
      pt="xs"
      pb="xs"
      style={{
        backgroundColor: theme.colors.dark[7],
      }}
    >
      <Title order={3} ta="center">
        Community Cards ({pokerGame.gameState})
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
      <Flex justify="center" gap="sm">
        <PlayingCard card="2d" onClick={() => {}} disabled={true} />
        <PlayingCard card="2d" onClick={() => {}} disabled={true} />
        <PlayingCard card="2d" onClick={() => {}} disabled={true} />
        <PlayingCard card="2d" onClick={() => {}} disabled={true} />
        <PlayingCard card="2d" onClick={() => {}} disabled={true} />
      </Flex>
    </Card>
  );
}
