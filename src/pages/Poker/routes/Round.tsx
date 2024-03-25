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

  const nextTurn = () => {
    let currentPlayerIndex = pokerPlayers.findIndex(
      (player) => player.id === pokerGame.currentTurn
    );

    if (pokerGame.currentTurn == pokerGame.currentBigBlind && pokerGame.gameState == "PREFLOP") {
      // End of preflop
      setPokerGame({
        ...pokerGame,
        gameState: "FLOP",
        currentTurn: pokerGame.currentSmallBlind,
        currentBet: 0,
      });

      setPokerPlayers((pokerPlayers) => {
        pokerPlayers.forEach((player) => {
          player.currentBet = 0;
        });
        return pokerPlayers;
      });
      return;
    }

    setPokerGame({
      ...pokerGame,
      currentTurn: pokerPlayers[(currentPlayerIndex + 1) % pokerPlayers.length].id,
    });
  };

  const checkAction = () => {
    nextTurn();
  };

  const raiseAction = (raiseTo: number) => {};

  // const betAction = (amount: number) => {
  //   let currentPlayerIndex = pokerPlayers.findIndex(
  //     (player) => player.id === pokerGame.currentTurn
  //   );

  //   setPokerGame({
  //     ...pokerGame,
  //     currentBet: pokerGame.currentBet + amount,
  //   })
  // };
  const betAction = (amount: number) => {
    let currentPlayerIndex = pokerPlayers.findIndex(
      (player) => player.id === pokerGame.currentTurn
    );
    let pokerPlayer = { ...pokerPlayers.find((player) => player.id === pokerGame.currentTurn)! };
    let player = { ...getPlayer(pokerPlayer.id, players)! };

    if (Math.abs(amount - player.balance) < 0.0001) {
      // floating point comparison
      pokerPlayer.allIn = true;
    }

    if (!pokerPlayer.allIn) {
      const _lastPot = pokerGame.pots[pokerGame.pots.length - 1];
      let lastPot = {
        type: _lastPot.type,
        participants: [..._lastPot.participants],
        amount: { ..._lastPot.amount },
      };

      lastPot.amount[pokerPlayer.id] = amount;
      if (!lastPot.participants.includes(pokerPlayer.id)) {
        lastPot.participants.push(pokerPlayer.id);
      }

      setPokerGame({
        ...pokerGame,
        pots: [...pokerGame.pots.slice(0, pokerGame.pots.length - 1), lastPot],
        currentTurn: pokerPlayers[(currentPlayerIndex + 1) % pokerPlayers.length].id,
        currentBet: Math.max(pokerGame.currentBet, amount),
      });
    } else {
      //
    }

    pokerPlayer.currentBet = amount;
    player.balance -= amount;

    setPlayers((players) => {
      let playerIndex = players.findIndex((player) => player.id === pokerPlayer.id);
      players[playerIndex] = player;
      return players;
    });

    setPokerPlayers((pokerPlayers) => {
      let playerIndex = pokerPlayers.findIndex((player) => player.id === pokerPlayer.id);
      pokerPlayers[playerIndex] = pokerPlayer;
      return pokerPlayers;
    });
  };

  const callAction = () => {
    let currentPlayerIndex = pokerPlayers.findIndex(
      (player) => player.id === pokerGame.currentTurn
    );
    let pokerPlayer = { ...pokerPlayers.find((player) => player.id === pokerGame.currentTurn)! };
    let player = { ...getPlayer(pokerPlayer.id, players)! };

    let amountToCall = pokerGame.currentBet - pokerPlayer.currentBet;
    if (amountToCall > player.balance) {
      amountToCall = player.balance;
      pokerPlayer.allIn = true;
    } else {
      // deep copy the last pot
      const _lastPot = pokerGame.pots[pokerGame.pots.length - 1];
      let lastPot = {
        type: _lastPot.type,
        participants: [..._lastPot.participants],
        amount: { ..._lastPot.amount },
      };
      lastPot.amount[pokerPlayer.id] = amountToCall;
      if (!lastPot.participants.includes(pokerPlayer.id)) {
        lastPot.participants.push(pokerPlayer.id);
      }

      setPokerGame({
        ...pokerGame,
        pots: [...pokerGame.pots.slice(0, pokerGame.pots.length - 1), lastPot],
        currentTurn: pokerPlayers[(currentPlayerIndex + 1) % pokerPlayers.length].id,
      });
    }

    pokerPlayer.currentBet += amountToCall;
    player.balance -= amountToCall;

    setPlayers((players) => {
      let playerIndex = players.findIndex((player) => player.id === pokerPlayer.id);
      players[playerIndex] = player;
      return players;
    });

    setPokerPlayers((pokerPlayers) => {
      let playerIndex = pokerPlayers.findIndex((player) => player.id === pokerPlayer.id);
      pokerPlayers[playerIndex] = pokerPlayer;
      return pokerPlayers;
    });

    // nextTurn();
  };

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
              checkAction={checkAction}
              callAction={callAction}
              raiseAction={raiseAction}
              betAction={betAction}
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
