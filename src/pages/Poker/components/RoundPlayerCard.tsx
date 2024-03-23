import { POKER_GAME_STATE, POKER_SETTINGS_STATE } from "@/Root";
import GenericPlayerCard from "@/components/GenericPlayerCard";
import PlayingCard from "@/components/PlayingCard";
import { CARD_SELECTOR_STATE } from "@/pages/Blackjack/routes/Round";
import { Player } from "@/types/Player";
import { PokerPlayer } from "@/types/Poker";
import { formatMoney } from "@/utils/MoneyHelper";
import { Button, Container, Divider, Flex, Group, Text, useMantineTheme } from "@mantine/core";
import { useRecoilState, useRecoilValue } from "recoil";
import { DealerBadge, SmallBlindBadge, BigBlindBadge } from "../routes/PreRound";

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
  const pokerGame = useRecoilValue(POKER_GAME_STATE);
  const pokerSettings = useRecoilValue(POKER_SETTINGS_STATE);

  return (
    <GenericPlayerCard
      header={
        <>
          <Flex align="center" mr="sm" gap="xs">
            {pokerPlayer.displayName} {pokerGame.currentDealer == player.id && <DealerBadge />}
            {pokerSettings.forcedBetOption == "BLINDS" &&
              pokerGame.currentSmallBlind == player.id && <SmallBlindBadge />}
            {pokerSettings.forcedBetOption == "BLINDS" &&
              pokerGame.currentBigBlind == player.id && <BigBlindBadge />}
          </Flex>
        </>
      }
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
