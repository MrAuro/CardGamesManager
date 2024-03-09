import { BLACKJACK_SETTINGS, BLACKJACK_PLAYERS_STATE, BLACKJACK_GAME_STATE } from "@/Root";
import PlayingCard from "@/components/PlayingCard";
import { useRecoilImmerState } from "@/utils/RecoilImmer";
import { useMantineTheme, Group, Text } from "@mantine/core";
import { atom, useRecoilState } from "recoil";
import DealerItem from "../components/DealerItem";
import GenericCard from "@/components/GenericPlayerCard";
import GenericPlayerCard from "@/components/GenericPlayerCard";
import CardSelector from "@/components/CardSelector";
import { Card } from "@/types/Card";

export const CARD_SELECTOR_STATE = atom<{
  opened: boolean;
  intitalCard: Card;
  onSubmitTarget: string; // ID of a player or "DEALER"
  onSubmitIndex: number; // Index of the card in the player's hand
}>({
  key: "CARD_SELECTOR",
  default: {
    opened: false,
    intitalCard: "--",
    onSubmitTarget: "",
    onSubmitIndex: 0,
  },
});

export default function Round() {
  const theme = useMantineTheme();
  const [blackjackSettings] = useRecoilState(BLACKJACK_SETTINGS);
  const [blackjackPlayers, setBlackjackPlayers] = useRecoilImmerState(BLACKJACK_PLAYERS_STATE);
  const [blackjackGame, setBlackjackGame] = useRecoilState(BLACKJACK_GAME_STATE);
  const [cardSelector, setCardSelector] = useRecoilState(CARD_SELECTOR_STATE);

  return (
    <>
      <CardSelector
        opened={cardSelector.opened}
        intitialCard={cardSelector.intitalCard}
        onSubmit={(card) => {
          if (cardSelector.onSubmitTarget == "DEALER") {
            setBlackjackGame({
              ...blackjackGame,
              dealerCards: blackjackGame.dealerCards.map((prevCard, index) =>
                index == cardSelector.onSubmitIndex ? card : prevCard
              ),
            });
          } else {
            setBlackjackPlayers((players) => {
              let playerindex = players.findIndex(
                (player) => player.id == cardSelector.onSubmitTarget
              );

              if (playerindex == -1) {
                console.warn("Player not found when submitting card", cardSelector.onSubmitTarget);
              } else {
                players[playerindex].cards[cardSelector.onSubmitIndex] = card;
              }

              return players;
            });
          }

          setCardSelector({
            ...cardSelector,
            opened: false,
          });
        }}
      />
      <DealerItem
        cards={blackjackGame.dealerCards}
        isActive={blackjackGame.currentTurn == "DEALER"}
        firstTurn={blackjackGame.dealerFirstTime}
      />
    </>
  );
}
