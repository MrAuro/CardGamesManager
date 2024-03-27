import {
  KEYBINDINGS_STATE,
  PLAYERS_STATE,
  POKER_GAME_STATE,
  POKER_PLAYERS_STATE,
  POKER_SETTINGS_STATE,
} from "@/Root";
import { useRecoilImmerState } from "@/utils/RecoilImmer";
import { Button, CardSection, Flex, useMantineTheme } from "@mantine/core";
import { useRecoilState } from "recoil";
import CommunityCards from "../components/CommunityCards";
import RoundPlayerCard from "../components/RoundPlayerCard";
import { getPlayer } from "@/utils/PlayerHelper";
import CardSelector from "@/components/CardSelector";
import { CARD_SELECTOR_STATE } from "@/pages/Blackjack/routes/Round";
import { useState } from "react";
import { Card } from "@/types/Card";
import cloneDeep from "lodash/cloneDeep";
import { GameState, PokerGame, PokerPlayer, PokerPot } from "@/types/Poker";
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

  const collectBets = (
    tempPokerGame: PokerGame,
    tempPokerPlayers: PokerPlayer[]
  ): [PokerGame, PokerPlayer[]] => {
    // Puts all active bets into pots and sidepots
    let currentBets = cloneDeep(tempPokerGame.currentBets);
    let pots = cloneDeep(tempPokerGame.pots);

    // Function to handle the distribution of bets into pots
    const distributeBetsToPots = (
      bets: { [playerId: string]: { amount: number; dontAddToPot?: boolean } },
      pots: PokerPot[]
    ) => {
      let smallestBet = Number.MAX_VALUE;
      let playersWithBets = Object.entries(bets).filter(
        ([_, bet]) => bet.amount > 0 && !bet.dontAddToPot
      );

      if (playersWithBets.length === 0) {
        return; // No bets to distribute
      }

      // Find the smallest bet among all players
      playersWithBets.forEach(([_, bet]) => {
        if (bet.amount < smallestBet) {
          smallestBet = bet.amount;
        }
      });

      // Determine the main pot or create a new one if necessary
      let mainPot = pots.find((pot) => !pot.closed) || {
        amount: 0,
        eligiblePlayers: [],
        closed: false,
      };
      if (!pots.includes(mainPot)) {
        pots.push(mainPot);
      }

      // Distribute the smallest bet amount to the main pot
      playersWithBets.forEach(([playerId, bet]) => {
        mainPot.amount += smallestBet;
        bet.amount -= smallestBet;
        if (!mainPot.eligiblePlayers.includes(playerId)) {
          mainPot.eligiblePlayers.push(playerId);
        }
      });

      // Check if there's a need for a side pot
      if (playersWithBets.some(([_, bet]) => bet.amount > 0)) {
        mainPot.closed = true; // Close the current main pot
        distributeBetsToPots(bets, pots); // Recursively distribute remaining bets
      }
    };

    distributeBetsToPots(currentBets, pots);

    // Reset player bets and round pot amounts
    tempPokerPlayers.forEach((player) => (player.currentBet = 0));
    pots.forEach((pot) => (pot.amount = round(pot.amount)));

    // Clear current bets and update the game state
    tempPokerGame.currentBets = {};
    tempPokerGame.currentBet = 0;
    tempPokerGame.pots = pots;

    return [tempPokerGame, tempPokerPlayers];
  };

  const getNextTurnData = (
    _tempPokerGame: PokerGame,
    _tempPokerPlayers: PokerPlayer[]
  ): [PokerGame, PokerPlayer[]] => {
    console.log(`(ORDER) Getting next turn data`);
    let tempPokerGame = cloneDeep(_tempPokerGame);
    let tempPokerPlayers = cloneDeep(_tempPokerPlayers);

    const currentPlayerIndex = tempPokerPlayers.findIndex(
      (player) => player.id === tempPokerGame.currentTurn
    );
    tempPokerPlayers[currentPlayerIndex].beenOn = true;

    let everyoneBeenOn = tempPokerPlayers
      .filter((player) => !player.folded && !player.allIn)
      .every((player) => player.beenOn);

    let betsPending = false;
    for (const player of tempPokerPlayers) {
      if (!player.folded && !player.allIn) {
        if (player.currentBet < tempPokerGame.currentBet) {
          console.log(
            `${player.displayName} has not bet enough, ${player.currentBet} vs ${tempPokerGame.currentBet}`
          );
          betsPending = true;
          break;
        }
      }
    }

    console.log(`(ORDER) Everyone has been on: ${everyoneBeenOn}, Bets pending: ${betsPending}`);

    const goNextRound = () => {
      console.log(`(ORDER) Everyone has been on`);
      let dealerIndex = tempPokerPlayers.findIndex(
        (player) => player.id == tempPokerGame.currentDealer
      );
      let firstPlayerIndex = dealerIndex + 1;
      let limit = tempPokerPlayers.length;
      while (
        tempPokerPlayers[firstPlayerIndex].folded ||
        tempPokerPlayers[firstPlayerIndex].allIn
      ) {
        firstPlayerIndex = (firstPlayerIndex + 1) % tempPokerPlayers.length;
        limit--;

        if (limit <= 0) {
          break;
        }
      }

      tempPokerGame.currentTurn = tempPokerPlayers[firstPlayerIndex].id;
      let state: GameState = "FLOP";
      switch (tempPokerGame.gameState) {
        case "PREFLOP":
          state = "FLOP";
          break;
        case "FLOP":
          state = "TURN";
          break;
        case "TURN":
          state = "RIVER";
          break;
        case "RIVER":
          state = "SHOWDOWN";
          break;
        default:
          throw new Error(`Invalid game state ${tempPokerGame.gameState}`);
      }

      tempPokerGame.gameState = state;
      tempPokerPlayers = tempPokerPlayers.map((player) => {
        player.beenOn = false;
        return player;
      });
      const [_tempPokerGame, _tempPokerPlayers] = collectBets(tempPokerGame, tempPokerPlayers);
      tempPokerGame = _tempPokerGame;
      tempPokerPlayers = _tempPokerPlayers;
    };

    if (everyoneBeenOn && !betsPending) {
      goNextRound();
    } else {
      let nextPlayerIndex = (currentPlayerIndex + 1) % tempPokerPlayers.length;
      let limit = tempPokerPlayers.length;
      while (tempPokerPlayers[nextPlayerIndex].folded || tempPokerPlayers[nextPlayerIndex].allIn) {
        nextPlayerIndex = (nextPlayerIndex + 1) % tempPokerPlayers.length;
        limit--;

        if (limit <= 0) {
          break;
        }
      }

      tempPokerGame.currentTurn = tempPokerPlayers[nextPlayerIndex].id;
    }

    let newBetsPending = false;
    for (const player of tempPokerPlayers) {
      console.log(`${player.displayName} has bet ${player.currentBet}`);
      if (!player.folded && !player.allIn) {
        if (player.currentBet < tempPokerGame.currentBet) {
          console.log(
            `${player.displayName} has not bet enough, ${player.currentBet} vs ${tempPokerGame.currentBet}`
          );
          newBetsPending = true;
          break;
        }
      }
    }

    console.log(`(ORDER) Bets pending -> new: ${newBetsPending} | old: ${betsPending}`);

    if (newBetsPending == false && betsPending == true) {
      goNextRound();
    }

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

  const betAction = (amount: number) => {
    let tempPokerPlayers = cloneDeep(pokerPlayers);
    let tempPokerGame = cloneDeep(pokerGame);
    let tempPlayers = cloneDeep(players);

    let currentPlayerIndex = tempPokerPlayers.findIndex(
      (player) => player.id === tempPokerGame.currentTurn
    );
    let pokerPlayer = {
      ...tempPokerPlayers.find((player) => player.id === tempPokerGame.currentTurn)!,
    };
    let player = { ...getPlayer(pokerPlayer.id, tempPlayers)! };

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
    let currentBets = cloneDeep(tempPokerGame.currentBets);
    if (!currentBets[pokerPlayer.id]) {
      currentBets[pokerPlayer.id] = {
        amount: 0,
        dontAddToPot: false,
      };
    }
    currentBets[pokerPlayer.id].amount = amount;

    tempPokerGame.currentBets = currentBets;
    tempPokerGame.currentBet = Math.max(pokerGame.currentBet, amount);

    tempPokerPlayers[currentPlayerIndex] = pokerPlayer;

    player.balance = Math.round((player.balance - amount) * 100) / 100;
    tempPlayers[tempPlayers.findIndex((p) => p.id === player.id)] = player;

    const [_tempPokerGame, _tempPokerPlayers] = getNextTurnData(tempPokerGame, tempPokerPlayers);
    tempPokerGame = _tempPokerGame;
    tempPokerPlayers = _tempPokerPlayers;

    tempPokerPlayers.forEach((player) => {
      player.beenOn = false;
    });

    tempPokerPlayers[currentPlayerIndex].beenOn = true;

    setPlayers(tempPlayers);
    setPokerGame(tempPokerGame);
    setPokerPlayers(tempPokerPlayers);
  };

  const callAction = () => {
    let tempPokerPlayers = cloneDeep(pokerPlayers);
    let tempPokerGame = cloneDeep(pokerGame);
    let tempPlayers = cloneDeep(players);

    let currentPlayerIndex = tempPokerPlayers.findIndex(
      (player) => player.id === tempPokerGame.currentTurn
    );
    let pokerPlayer = {
      ...tempPokerPlayers.find((player) => player.id === tempPokerGame.currentTurn)!,
    };
    let player = { ...getPlayer(pokerPlayer.id, tempPlayers)! };

    let amountToCallTo = tempPokerGame.currentBet - pokerPlayer.currentBet;

    if (pokerPlayer.allIn) {
      console.error(
        `Player ${pokerPlayer.displayName} is already all in`,
        pokerPlayer,
        player,
        amountToCallTo
      );
      return;
    }

    console.log(
      `(CALL) Player ${pokerPlayer.displayName} calls ${amountToCallTo} (${player.balance})`
    );
    if (player.balance <= amountToCallTo) {
      console.log(`Player ${pokerPlayer.displayName} is all in`);
      pokerPlayer.allIn = true;
      pokerPlayer.currentBet = player.balance;
      amountToCallTo = player.balance;
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
    pokerPlayer.currentBet = round(pokerPlayer.currentBet);
    tempPokerPlayers[currentPlayerIndex] = pokerPlayer;

    const [_tempPokerGame, _tempPokerPlayers] = getNextTurnData(tempPokerGame, tempPokerPlayers);
    tempPokerGame = _tempPokerGame;
    tempPokerPlayers = _tempPokerPlayers;

    tempPokerPlayers[currentPlayerIndex] = {
      ...pokerPlayer,
      beenOn: _tempPokerPlayers[currentPlayerIndex].beenOn,
    };

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
          if (cardSelector.onSubmitTarget == "COMMUNITY_CARDS") {
            const cards = cloneDeep(pokerGame.communityCards);
            cards[cardSelector.onSubmitIndex] = card;

            setPokerGame({
              ...pokerGame,
              communityCards: cards,
            });
          } else {
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
          }

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
            <div
              style={{
                opacity: pokerPlayer.folded ? 0.25 : 1,
                filter: pokerPlayer.folded ? "blur(1.5px)" : "none",
              }}
            >
              <RoundPlayerCard
                player={getPlayer(pokerPlayer.id, players)!}
                pokerPlayer={pokerPlayer}
                active={pokerPlayer.id === pokerGame.currentTurn}
                key={pokerPlayer.id}
                checkAction={checkAction}
                callAction={callAction}
                betAction={betAction}
                foldAction={foldAction}
              />
            </div>
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
