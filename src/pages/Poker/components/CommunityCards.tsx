import PlayingCard from "@/components/PlayingCard";
import { Card, Divider, Flex, Text, Title, useMantineTheme } from "@mantine/core";

export default function CommunityCards() {
  const theme = useMantineTheme();

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
        Community Cards
      </Title>
      <Text size="sm" ta="center" fw={500}>
        Pot: $123.45
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
