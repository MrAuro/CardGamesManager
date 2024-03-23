import GenericPlayerCard from "@/components/GenericPlayerCard";
import PlayingCard from "@/components/PlayingCard";
import { CARD_SELECTOR_STATE } from "@/pages/Blackjack/routes/Round";
import { Player } from "@/types/Player";
import { PokerPlayer } from "@/types/Poker";
import { formatMoney } from "@/utils/MoneyHelper";
import { Button, Container, Divider, Group, Text, useMantineTheme } from "@mantine/core";
import { useRecoilState } from "recoil";

export default function RoundPlayerCard({
  player,
  pokerPlayer,
  active,
}: {
  player: Player;
  pokerPlayer: PokerPlayer;
  active: boolean;
}) {
  const theme = useMantineTheme();
  const [cardSelector, setCardSelector] = useRecoilState(CARD_SELECTOR_STATE);

  return (
    <GenericPlayerCard
      header={pokerPlayer.displayName}
      backgroundColor={active ? theme.colors.dark[6] : theme.colors.dark[7]}
      subsection={
        <Text size="md" fw={600}>
          {formatMoney(player.balance)}
        </Text>
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
        <Group grow>
          <Button fullWidth color="green" disabled={!active}>
            Check
          </Button>
          <Button fullWidth color="red" disabled={!active}>
            Fold
          </Button>
          <Button fullWidth color="blue" disabled={!active}>
            Bet
          </Button>
        </Group>
      </>
    </GenericPlayerCard>
  );
}
