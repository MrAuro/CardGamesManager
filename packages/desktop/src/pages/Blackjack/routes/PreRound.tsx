import {
  BLACKJACK_GAME_STATE,
  BLACKJACK_PLAYERS_STATE,
  BLACKJACK_SETTINGS,
  KEYBINDINGS_STATE,
  PLAYERS_STATE,
} from "@/Root";
import PlayerSelector from "@/components/PlayerSelector";
import { EMPTY_CARD } from "@/utils/CardHelper";
import { useRecoilImmerState } from "@/utils/RecoilImmer";
import { Draggable, DraggableStateSnapshot } from "@hello-pangea/dnd";
import { Alert, Button, Divider, Text, Title, useMantineTheme } from "@mantine/core";
import { IconInfoTriangle } from "@tabler/icons-react";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useRecoilState, useRecoilValue } from "recoil";
import PreRoundPlayerCard from "../components/PreRoundPlayerCard";
import { PLAYER_HAND_RESULTS } from "@/pages/Poker/routes/Round";
import { HOTKEY_SELECTOR_A_ENABLED, HOTKEY_SELECTOR_B_ENABLED } from "@/App";

function getStyle(style: any, snapshot: DraggableStateSnapshot) {
  if (!snapshot.isDropAnimating) {
    return style;
  }
  const { curve, duration } = snapshot.dropAnimation!;

  return {
    ...style,
    opacity: snapshot.isDragging && !snapshot.isDropAnimating ? 0.65 : 1,
    transition: `all ${curve} ${duration + 500}ms`,
  };
}

export default function PreRound() {
  const theme = useMantineTheme();
  const [blackjackSettings] = useRecoilState(BLACKJACK_SETTINGS);
  const [blackjackPlayers, setBlackjackPlayers] = useRecoilImmerState(BLACKJACK_PLAYERS_STATE);
  const [blackjackGame, setBlackjackGame] = useRecoilState(BLACKJACK_GAME_STATE);
  const [, setPlayers] = useRecoilImmerState(PLAYERS_STATE);
  const [keybindings] = useRecoilImmerState(KEYBINDINGS_STATE);
  const [_, setPlayerHandResults] = useRecoilState(PLAYER_HAND_RESULTS);

  const [sidebetsOpen, setSidebetsOpen] = useState<string[]>([]);
  const [gameErrors, setGameErrors] = useState<string[]>([]);

  const selectorA = useRecoilValue(HOTKEY_SELECTOR_A_ENABLED);
  const selectorB = useRecoilValue(HOTKEY_SELECTOR_B_ENABLED);

  keybindings.forEach((keybinding) => {
    if (keybinding.scope === "Blackjack PreRound") {
      useHotkeys(keybinding.key, () => {
        if (keybinding.selector == "A" && !selectorA) return;
        if (keybinding.selector == "B" && !selectorB) return;

        if (keybinding.selector == "None" && (selectorA || selectorB)) return;

        switch (keybinding.action) {
          case "Start Game":
            startGame();
            break;
        }
      });
    }
  });

  const startGame = () => {
    let tempGameErrors = [];
    if (blackjackPlayers.length < 1) {
      tempGameErrors.push("At least one player is required");
    }

    if (blackjackPlayers.some((player) => player.errors.length > 0)) {
      tempGameErrors.push("Invalid bets");
    }

    setGameErrors(tempGameErrors);
    if (tempGameErrors.length > 0) return;

    setBlackjackGame({
      ...blackjackGame,
      currentTurn: blackjackPlayers[0].id,
      gameState: "ROUND",
      dealerCards: [EMPTY_CARD, EMPTY_CARD],
      dealerFirstTime: false,
    });

    setPlayers((draft) => {
      draft.forEach((player) => {
        // player.balance -= blackjackPlayers.find((p) => p.id === player.id)?.bet || 0;
        const blackjackPlayer = blackjackPlayers.find((p) => p.id === player.id);
        if (blackjackPlayer) {
          player.balance -= blackjackPlayer.bet;

          player.balance -= blackjackPlayer.sidebets.perfectPairs;
          player.balance -= blackjackPlayer.sidebets.twentyOnePlusThree;
          player.balance -= blackjackPlayer.sidebets.betBehind.bet;

          if (player.balance < 0) {
            player.balance = 0;
          }
        }
      });
    });

    setBlackjackPlayers((draft) => {
      draft.forEach((blackjackPlayer) => {
        blackjackPlayer.cards = [EMPTY_CARD, EMPTY_CARD];
        blackjackPlayer.doubledDown = false;
        blackjackPlayer.split = false;
        blackjackPlayer.splitFrom = undefined;
      });
    });

    setPlayerHandResults([]);
  };

  return (
    <>
      {gameErrors.length > 0 && (
        <Alert color="red" title="Game Errors" icon={<IconInfoTriangle />}>
          {gameErrors.map((error) => (
            <Text key={error}>{error}</Text>
          ))}
        </Alert>
      )}
      {blackjackPlayers.some((player) => player.errors.length > 0) && (
        <Alert color="red" title="Invalid bets" icon={<IconInfoTriangle />}>
          {blackjackPlayers
            .filter((player) => player.errors.length > 0)
            .map((player) => {
              return (
                <Text key={player.id}>
                  <b>{player.displayName}</b>: {player.errors.join(", ")}
                </Text>
              );
            })}
        </Alert>
      )}
      <Button
        fullWidth
        mt="sm"
        disabled={
          blackjackPlayers.some((player) => player.errors.length > 0) || blackjackPlayers.length < 1
        }
        onClick={startGame}
      >
        Start Game
      </Button>
      <Divider my="md" />
      <Title order={2} mb="sm">
        Players
      </Title>
      <PlayerSelector
        game="BLACKJACK"
        playerElement={(index, player, removePlayer, blackjackPlayer) => {
          console.log(`Player  Element:`, index, player, blackjackPlayer);

          if (!blackjackPlayer) return <></>;

          return (
            <Draggable key={player.id} index={index} draggableId={player.id}>
              {(provided, snapshot) => (
                <div
                  key={player.id}
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={{
                    ...getStyle(provided.draggableProps.style, snapshot),
                    isDragging: snapshot.isDragging && !snapshot.isDropAnimating,
                    marginBottom: theme.spacing.sm,
                    opacity: snapshot.isDragging && !snapshot.isDropAnimating ? 0.65 : 1,
                  }}
                >
                  <PreRoundPlayerCard
                    player={player}
                    blackjackPlayer={blackjackPlayer}
                    setBlackjackPlayers={setBlackjackPlayers}
                    index={index}
                    blackjackSettings={blackjackSettings}
                    sidebetsOpen={sidebetsOpen}
                    setSidebetsOpen={setSidebetsOpen}
                    blackjackPlayers={blackjackPlayers}
                    removePlayer={removePlayer}
                  />
                </div>
              )}
            </Draggable>
          );
        }}
      />
    </>
  );
}
