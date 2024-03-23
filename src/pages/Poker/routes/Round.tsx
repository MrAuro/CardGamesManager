import {
  KEYBINDINGS_STATE,
  PLAYERS_STATE,
  POKER_GAME_STATE,
  POKER_PLAYERS_STATE,
  POKER_SETTINGS_STATE,
} from "@/Root";
import { useRecoilImmerState } from "@/utils/RecoilImmer";
import { Button, Flex, useMantineTheme } from "@mantine/core";
import { useRecoilState } from "recoil";
import CommunityCards from "../components/CommunityCards";
import RoundPlayerCard from "../components/RoundPlayerCard";
import { getPlayer } from "@/utils/PlayerHelper";
import CardSelector from "@/components/CardSelector";
import { CARD_SELECTOR_STATE } from "@/pages/Blackjack/routes/Round";
import { useState } from "react";
import { Card } from "@/types/Card";

export default function Round() {
  const [pokerGame, setPokerGame] = useRecoilState(POKER_GAME_STATE);
  const theme = useMantineTheme();
  const [pokerSettings] = useRecoilState(POKER_SETTINGS_STATE);
  const [pokerPlayers, setPokerPlayers] = useRecoilImmerState(POKER_PLAYERS_STATE);
  const [players, setPlayers] = useRecoilImmerState(PLAYERS_STATE);
  const [keybindings] = useRecoilImmerState(KEYBINDINGS_STATE);
  const [cardSelector, setCardSelector] = useRecoilState(CARD_SELECTOR_STATE);
  const [activeCardOverride, setActiveCardOverride] = useState<Card | undefined>(undefined);

  return (
    <>
      <CardSelector
        opened={cardSelector.opened}
        intitialCard={cardSelector.intitalCard}
        activeCardOverride={activeCardOverride}
        onSubmit={(card) => {
          setPokerPlayers((pokerPlayers) => {
            let playerIndex = pokerPlayers.findIndex(
              (player) => player.id == cardSelector.onSubmitTarget
            );

            if (playerIndex == -1) {
              console.warn("Player not found when submitting card", cardSelector.onSubmitTarget);
            } else {
              pokerPlayers[playerIndex].cards[cardSelector.onSubmitIndex] = card;
            }

            return pokerPlayers;
          });

          setCardSelector({
            ...cardSelector,
            opened: false,
          });
        }}
      />

      <Flex direction="column" gap="xs">
        <CommunityCards />
        {pokerPlayers.map((pokerPlayer) => {
          return (
            <RoundPlayerCard
              player={getPlayer(pokerPlayer.id, players)!}
              pokerPlayer={pokerPlayer}
              active={pokerPlayer.id === pokerGame.currentTurn}
              key={pokerPlayer.id}
            />
          );
        })}
      </Flex>
      <Button
        onClick={() => {
          setPokerGame({
            ...pokerGame,
            gameState: "PREROUND",
          });
        }}
      >
        set preround
      </Button>
    </>
  );
}
