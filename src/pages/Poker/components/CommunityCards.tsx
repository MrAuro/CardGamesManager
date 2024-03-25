import { POKER_GAME_STATE, POKER_PLAYERS_STATE } from "@/Root";
import PlayingCard from "@/components/PlayingCard";
import { formatMoney } from "@/utils/MoneyHelper";
import { Card, Divider, Flex, Text, Title, useMantineTheme } from "@mantine/core";
import { useRecoilValue } from "recoil";

export default function CommunityCards() {
  const theme = useMantineTheme();
  const pokerGame = useRecoilValue(POKER_GAME_STATE);
  const pokerPlayers = useRecoilValue(POKER_PLAYERS_STATE);

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
        {pokerGame.pots.map((pot) => {
          return (
            <Text key={`${pot.amount}-${pot.type}-${pot.participants.join(",")}`}>
              <b>
                {pot.type} Pot{" "}
                {formatMoney(Object.values(pot.amount).reduce((sum, value) => sum + value, 0))}
              </b>
              <br />
              {pot.participants
                .map(
                  (participant) =>
                    pokerPlayers.find((player) => player.id === participant)?.displayName
                )
                .join(", ")}
            </Text>
          );
        })}
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