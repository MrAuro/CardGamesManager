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
import cloneDeep from "lodash/cloneDeep";
import { PokerGame, PokerPlayer, PokerPot } from "@/types/Poker";
import { round } from "@/utils/MoneyHelper";
import { Player } from "@/types/Player";

export default function Round() {
  const [pokerGame, setPokerGame] = useRecoilState(POKER_GAME_STATE);
  const theme = useMantineTheme();
  const [pokerSettings] = useRecoilState(POKER_SETTINGS_STATE);
  const [pokerPlayers, setPokerPlayers] = useRecoilImmerState(POKER_PLAYERS_STATE);
  const [players, setPlayers] = useRecoilImmerState(PLAYERS_STATE);
  const [keybindings] = useRecoilImmerState(KEYBINDINGS_STATE);
  const [cardSelector, setCardSelector] = useRecoilState(CARD_SELECTOR_STATE);
  const [activeCardOverride, setActiveCardOverride] = useState<Card | undefined>(undefined);

  const getNextTurnData = (
    _tempPokerGame: PokerGame,
    _tempPokerPlayers: PokerPlayer[]
  ): [PokerGame, PokerPlayer[]] => {
    let tempPokerGame = cloneDeep(_tempPokerGame);
    let tempPokerPlayers = cloneDeep(_tempPokerPlayers);

    const playingPlayers = tempPokerPlayers.filter((player) => !player.folded && !player.allIn);
    let currentPlayerIndex = playingPlayers.findIndex(
      (player) => player.id === tempPokerGame.currentTurn
    );

    if (playingPlayers.length == 0) {
      // TODO
    }

    let nextPlayerIndex = (currentPlayerIndex + 1) % playingPlayers.length;
    let nextPlayer = playingPlayers[nextPlayerIndex];

    if (playingPlayers.length == 1) {
      // TODO
    }

    tempPokerGame.currentTurn = nextPlayer.id;

    return [tempPokerGame, tempPokerPlayers];
  };

  const collectBets = (
    tempPokerGame: PokerGame,
    tempPokerPlayers: PokerPlayer[]
  ): [PokerGame, PokerPlayer[]] => {
    // Puts all active bets into pots and sidepots
    let currentBets = cloneDeep(pokerGame.currentBets);
    let pots = cloneDeep(pokerGame.pots);

    let smallestBet = Number.MAX_VALUE;
    let largestBet = 0;
    for (const [playerId, bet] of Object.entries(currentBets)) {
      if (bet.amount < smallestBet) {
        smallestBet = bet.amount;
      }

      if (bet.amount > largestBet) {
        largestBet = bet.amount;
      }
    }

    if (smallestBet == largestBet) {
      // All bets are the same, so just add them to the main pot, no need for side pots
      let mainPot = pots[0];

      for (const [playerId, bet] of Object.entries(currentBets)) {
        if (bet.dontAddToPot) {
          if (
            pokerGame.currentSmallBlind == playerId &&
            pokerSettings.forcedBetOption == "BLINDS"
          ) {
            mainPot.amount -= pokerSettings.smallBlind;
            mainPot.amount += bet.amount;
          } else {
            continue;
          }
        } else {
          mainPot.amount += bet.amount;
        }
      }
    } else {
      // pepeLaugh good luck
    }

    tempPokerPlayers.forEach((pokerPlayer) => {
      pokerPlayer.currentBet = 0;
    });

    pots.forEach((pot) => {
      pot.amount = round(pot.amount);
    });

    tempPokerGame.currentBets = {};
    tempPokerGame.currentBet = 0;
    tempPokerGame.pots = pots;

    return [tempPokerGame, tempPokerPlayers];
  };

  const foldAction = () => {
    console.log(`Player folds`);
    let tempPokerGame = cloneDeep(pokerGame);
    let tempPokerPlayers = cloneDeep(pokerPlayers);

    tempPokerPlayers = tempPokerPlayers.map((player) => {
      if (player.id == tempPokerGame.currentTurn) {
        player.folded = true;
      }

      return player;
    });
    const [_tempPokerGame, _tempPokerPlayers] = getNextTurnData(tempPokerGame, tempPokerPlayers);
    tempPokerGame = _tempPokerGame;
    tempPokerPlayers = _tempPokerPlayers;

    setPokerGame(tempPokerGame);
    setPokerPlayers(tempPokerPlayers);
  };

  const checkAction = () => {
    let tempPokerGame = cloneDeep(pokerGame);
    let tempPokerPlayers = cloneDeep(pokerPlayers);

    const [_tempPokerGame, _tempPokerPlayers] = getNextTurnData(tempPokerGame, tempPokerPlayers);
    tempPokerGame = _tempPokerGame;
    tempPokerPlayers = _tempPokerPlayers;

    setPokerGame(tempPokerGame);
    setPokerPlayers(tempPokerPlayers);
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

    if (pokerPlayer.allIn) {
      console.error(
        `Player ${pokerPlayer.displayName} is already all in`,
        pokerPlayer,
        player,
        amount
      );
      return;
    }

    // Floating point comparison
    if (Math.abs(player.balance - amount) < 0.0001) {
      pokerPlayer.allIn = true;
    }

    pokerPlayer.currentBet = amount;
    let currentBets = cloneDeep(pokerGame.currentBets);
    if (!currentBets[pokerPlayer.id]) {
      currentBets[pokerPlayer.id] = {
        amount: 0,
        dontAddToPot: false,
      };
    }
    currentBets[pokerPlayer.id].amount = amount;
    setPokerGame({
      ...pokerGame,
      currentBets: currentBets,
      currentTurn: pokerPlayers[(currentPlayerIndex + 1) % pokerPlayers.length].id,
      currentBet: Math.max(pokerGame.currentBet, amount),
    });

    setPokerPlayers((pokerPlayers) => {
      pokerPlayers[currentPlayerIndex] = pokerPlayer;
      return pokerPlayers;
    });

    // Prevent weird floating point errors
    player.balance = Math.round((player.balance - amount) * 100) / 100;

    setPlayers((players) => {
      let playerIndex = players.findIndex((player) => player.id === pokerPlayer.id);
      players[playerIndex] = player;
      return players;
    });
  };

  const callAction = () => {
    const tempPokerPlayers = cloneDeep(pokerPlayers);
    const tempPokerGame = cloneDeep(pokerGame);
    const tempPlayers = cloneDeep(players);

    let currentPlayerIndex = tempPokerPlayers.findIndex(
      (player) => player.id === tempPokerGame.currentTurn
    );
    let pokerPlayer = {
      ...tempPokerPlayers.find((player) => player.id === tempPokerGame.currentTurn)!,
    };
    let player = { ...getPlayer(pokerPlayer.id, tempPlayers)! };

    const amountToCallTo = tempPokerGame.currentBet - pokerPlayer.currentBet;

    if (pokerPlayer.allIn) {
      console.error(
        `Player ${pokerPlayer.displayName} is already all in`,
        pokerPlayer,
        player,
        amountToCallTo
      );
      return;
    }

    if (player.balance < amountToCallTo) {
      pokerPlayer.allIn = true;
      pokerPlayer.currentBet = player.balance;
    } else {
      pokerPlayer.currentBet = tempPokerGame.currentBet;
    }

    let currentBets = cloneDeep(tempPokerGame.currentBets);
    console.log(currentBets);
    if (!currentBets[pokerPlayer.id]) {
      currentBets[pokerPlayer.id] = {
        amount: 0,
        dontAddToPot: false,
      };
    }
    currentBets[pokerPlayer.id].amount = pokerPlayer.currentBet;

    //  Round all bets to the hundredths place
    for (const playerId in currentBets) {
      currentBets[playerId].amount = round(currentBets[playerId].amount);
    }

    tempPokerGame.currentBets = currentBets;
    tempPokerGame.currentTurn =
      tempPokerPlayers[(currentPlayerIndex + 1) % tempPokerPlayers.length].id;

    pokerPlayer.currentBet = round(pokerPlayer.currentBet);
    tempPokerPlayers[currentPlayerIndex] = pokerPlayer;

    player.balance = round(player.balance - amountToCallTo);
    tempPlayers[tempPlayers.findIndex((p) => p.id === player.id)] = player;

    setPlayers(tempPlayers);
    setPokerGame(tempPokerGame);
    setPokerPlayers(tempPokerPlayers);
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
        {pokerPlayers
          .filter((p) => !p.folded)
          .map((pokerPlayer) => {
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
                foldAction={foldAction}
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
