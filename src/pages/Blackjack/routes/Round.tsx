import {
  BLACKJACK_GAME_STATE,
  BLACKJACK_PLAYERS_STATE,
  BLACKJACK_SETTINGS,
  PLAYERS_STATE,
} from "@/Root";
import CardSelector from "@/components/CardSelector";
import { Card } from "@/types/Card";
import { useRecoilImmerState } from "@/utils/RecoilImmer";
import { Stack, useMantineTheme } from "@mantine/core";
import { atom, useRecoilState } from "recoil";
import DealerCard from "../components/DealerCard";
import RoundPlayerCard from "../components/RoundPlayerCard";
import { getPlayer } from "@/utils/PlayerHelper";

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
  const [players] = useRecoilState(PLAYERS_STATE);

  const nextTurn = (dealerFirstTurn: boolean = false) => {
    if (blackjackGame.currentTurn == "DEALER") {
      setBlackjackGame({
        ...blackjackGame,
        currentTurn: blackjackPlayers[0].id,
        dealerFirstTime: dealerFirstTurn,
      });
    } else {
      let turnIndex = blackjackPlayers.findIndex((p) => p.id === blackjackGame.currentTurn);

      let nextTurnIndex = turnIndex + 1;
      if (nextTurnIndex >= blackjackPlayers.length) {
        setBlackjackGame({
          ...blackjackGame,
          currentTurn: "DEALER",
        });
      } else {
        setBlackjackGame({
          ...blackjackGame,
          currentTurn: blackjackPlayers[nextTurnIndex].id,
        });
      }
    }
  };

  const forceTurn = (playerId: string) => {
    setBlackjackGame({
      ...blackjackGame,
      currentTurn: playerId,
    });
  };

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
      <Stack gap="sm">
        <DealerCard
          cards={blackjackGame.dealerCards}
          isActive={blackjackGame.currentTurn == "DEALER"}
          firstTurn={blackjackGame.dealerFirstTime}
          nextTurn={nextTurn}
          forceTurn={forceTurn}
        />
        {blackjackPlayers.map((blackjackPlayer) => {
          return (
            <RoundPlayerCard
              key={blackjackPlayer.id}
              player={getPlayer(blackjackPlayer.id, players)!}
              blackjackPlayer={blackjackPlayer}
              isActive={blackjackGame.currentTurn == blackjackPlayer.id}
              nextTurn={nextTurn}
              forceTurn={forceTurn}
            />
          );
        })}
      </Stack>
    </>
  );
}
