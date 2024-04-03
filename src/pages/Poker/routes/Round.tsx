import {
  KEYBINDINGS_STATE,
  PLAYERS_STATE,
  POKER_GAME_STATE,
  POKER_PLAYERS_STATE,
  POKER_SETTINGS_STATE,
} from "@/Root";
import CardSelector from "@/components/CardSelector";
import { CARD_SELECTOR_STATE } from "@/pages/Blackjack/routes/Round";
import { Card, CardRank, CardSuit, Card_NOEMPTY } from "@/types/Card";
import { availableCards } from "@/types/Keybindings";
import {
  GameState,
  PlayerResult,
  PokerGame,
  PokerPlayer,
  PokerPot,
  StoredPlayerResult,
} from "@/types/Poker";
import { EMPTY_CARD, getRandomCard, getRank, isAnyEmpty, isCardEmpty } from "@/utils/CardHelper";
import { formatMoney, round } from "@/utils/MoneyHelper";
import { getPlayer } from "@/utils/PlayerHelper";
import { joinedStringToCards, rankToNumber } from "@/utils/PokerHelper";
import { useRecoilImmerState } from "@/utils/RecoilImmer";
import {
  Button,
  Container,
  Divider,
  Flex,
  Group,
  Paper,
  Stack,
  Text,
  darken,
  useMantineTheme,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import cloneDeep from "lodash/cloneDeep";
import { TexasHoldem } from "poker-variants-odds-calculator";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { atom, useRecoilState } from "recoil";
import CommunityCards from "../components/CommunityCards";
import RoundPlayerCard from "../components/RoundPlayerCard";
import { getDealerData } from "./PreRound";

export const FOLD_CONFIRM = atom<boolean>({
  key: "FOLD_CONFIRM",
  default: false,
});

export const ALLIN_CONFIRM = atom<boolean>({
  key: "ALLIN_CONFIRM",
  default: false,
});

export const BETUI_OPEN = atom<boolean>({
  key: "BETUI_OPEN",
  default: false,
});

export const PLAYER_BET = atom<number>({
  key: "PLAYER_BET",
  default: 0,
});

export const TIMER_START = atom<number | null>({
  key: "TIMER_START",
  default: null,
});

export const HOLDEM_TABLE = atom<TexasHoldem | null>({
  key: "ODDS_CALCULATION",
  default: null,
});

export const PLAYER_HAND_RESULTS = atom<StoredPlayerResult[] | null>({
  key: "PLAYER_HAND_RESULTS",
  default: null,
});

export const USED_CARDS = atom<Card[]>({
  key: "USED_CARDS",
  default: [],
});

export default function Round() {
  const theme = useMantineTheme();

  const [pokerGame, setPokerGame] = useRecoilState(POKER_GAME_STATE);

  const [pokerPlayers, setPokerPlayers] = useRecoilImmerState(POKER_PLAYERS_STATE);
  const [pokerSettings] = useRecoilState(POKER_SETTINGS_STATE);
  const [players, setPlayers] = useRecoilImmerState(PLAYERS_STATE);
  const [cardSelector, setCardSelector] = useRecoilState(CARD_SELECTOR_STATE);
  const [activeCardOverride] = useState<Card | undefined>(undefined);
  const [keybindings] = useRecoilImmerState(KEYBINDINGS_STATE);
  // const [holdemTable, setHoldemTable] = useRecoilState(HOLDEM_TABLE);
  const [playerHandResults, setPlayerHandResults] = useRecoilState(PLAYER_HAND_RESULTS);
  const [usedCards, setUsedCards] = useRecoilState(USED_CARDS);

  // !
  const [foldConfirm, setFoldConfirm] = useRecoilState(FOLD_CONFIRM);
  const [allInConfirm, setAllInConfirm] = useRecoilState(ALLIN_CONFIRM);
  const [bet, setBet] = useRecoilState(PLAYER_BET);
  const [betUIOpen, setBetUIOpen] = useRecoilState(BETUI_OPEN);
  const [, setTimerStart] = useRecoilState(TIMER_START);
  const betInputRef = useRef<HTMLInputElement>(null);
  // !

  const calculateHands = (store: boolean = false): StoredPlayerResult[] | undefined => {
    const table = new TexasHoldem(pokerPlayers.length);

    const playingPlayers = pokerPlayers.filter((player) => !player.folded);
    if (playingPlayers.length <= 1) {
      console.log(`Not enough players to calculate hands, forcing player to win`);
      // The only player left is the winner
      if (store) {
        setPlayerHandResults([
          {
            id: playingPlayers[0].id,
            result: {
              handRank: "WINNER",
              hand: null,
              ties: 0,
              tiesPercentage: "0%",
              win: 1,
              winPercentage: "100%",
            },
          },
        ]);

        return;
      } else {
        return [
          {
            id: playingPlayers[0].id,
            result: {
              handRank: "WINNER",
              hand: null,
              ties: 0,
              tiesPercentage: "0%",
              win: 1,
              winPercentage: "100%",
            },
          },
        ];
      }
    }

    if (playingPlayers.some((player) => player.cards.some(isAnyEmpty))) {
      return;
    }

    if (pokerGame.communityCards.filter((card) => !isAnyEmpty(card)).length < 3) {
      return;
    }

    for (const player of playingPlayers) {
      table.addPlayer([player.cards[0], player.cards[1]]);
    }

    // Get non-playing players
    let deadCards: Card[] = [];
    pokerPlayers
      .filter((player) => player.folded)
      .forEach((player) => {
        for (const card of player.cards) {
          if (!isAnyEmpty(card)) {
            deadCards.push(card);
          }
        }
      });

    table.setDeadCards(deadCards);

    table.setBoard(pokerGame.communityCards.filter((card) => !isAnyEmpty(card)) as Card[]);

    const calculation = table.calculate();
    console.log(`(CALC):`, calculation.toJson());
    const tablePlayers = calculation.getPlayers();
    let highestCard = 0;

    for (const player of tablePlayers) {
      for (const card of joinedStringToCards(player.getHand()!)) {
        const rank = rankToNumber(getRank(card as Card_NOEMPTY));
        if (rank > highestCard) {
          highestCard = rank;
        }
      }
    }

    const results: StoredPlayerResult[] = [];
    for (const [index, player] of tablePlayers.entries()) {
      let corrospondingPokerPlayerId;
      for (const pokerPlayer of pokerPlayers) {
        if (pokerPlayer.cards[0] == joinedStringToCards(player.getHand()!)[0]) {
          corrospondingPokerPlayerId = pokerPlayer.id;
          break;
        }
      }

      if (!corrospondingPokerPlayerId) {
        notifications.show({
          message: "Could not find a corrosponding player",
          color: "red",
        });
        return;
      }

      let handRanking: string | null = null;
      let highestRank = 0;
      for (let [rank, value] of Object.entries(calculation.toJson().players[index].ranks)) {
        if (value > highestRank) {
          handRanking = rank;
        }
      }

      let hasHighestCard = false;
      joinedStringToCards(player.getHand()!).forEach((card) => {
        if (rankToNumber(getRank(card as Card_NOEMPTY)) == highestCard) {
          hasHighestCard = true;
        }
      });

      const result: PlayerResult = {
        handRank:
          handRanking == "HIGH_CARDS" ? (hasHighestCard ? "HIGH_CARDS" : null) : handRanking,
        hand: null,
        ties: player.getTies(),
        tiesPercentage: player.getTiesPercentageString(),
        win: player.getWins(),
        winPercentage: player.getWinsPercentageString(),
      };

      results.push({
        id: corrospondingPokerPlayerId,
        result: result,
      });
    }

    console.log(`(CALC):`, results);

    if (store) {
      setPlayerHandResults(results);
    } else {
      return results;
    }
  };

  useEffect(() => {
    calculateHands(true);
  }, [
    pokerGame.capturingCommunityCards,
    pokerGame.communityCards,
    pokerGame.gameState,
    pokerPlayers,
  ]);

  let cardsAllowed = 0;
  switch (pokerGame.gameState) {
    case "PREFLOP":
      cardsAllowed = 0;
      break;

    case "FLOP":
      cardsAllowed = 3;
      break;

    case "TURN":
      cardsAllowed = 4;
      break;

    case "RIVER":
    case "SHOWDOWN":
      cardsAllowed = 5;
      break;
  }

  useEffect(() => {
    let usedCards: Card[] = [];
    pokerPlayers.forEach((player) => {
      player.cards.forEach((card) => {
        if (!isAnyEmpty(card)) {
          usedCards.push(card);
        }
      });
    });

    pokerGame.communityCards.forEach((card) => {
      if (!isAnyEmpty(card)) {
        usedCards.push(card);
      }
    });

    if (new Set(usedCards).size !== usedCards.length) {
      notifications.show({
        message: "Duplicate cards are not allowed, removing duplicates",
        color: "red",
      });

      usedCards = [...new Set(usedCards)];
    }

    setUsedCards(usedCards);
  }, [pokerGame.communityCards, pokerPlayers]);

  const collectBets = (
    tempPokerGame: PokerGame,
    tempPokerPlayers: PokerPlayer[]
  ): [PokerGame, PokerPlayer[]] => {
    // Puts all active bets into pots and sidepots
    let currentBets = cloneDeep(tempPokerGame.currentBets);
    let pots = cloneDeep(tempPokerGame.pots);

    if (pokerGame.gameState === "PREFLOP") {
      let amountToSubtract = 0;
      if (
        pokerSettings.forcedBetOption === "BLINDS" ||
        pokerSettings.forcedBetOption === "BLINDS+ANTE"
      ) {
        amountToSubtract += pokerSettings.bigBlind;
        amountToSubtract += pokerSettings.smallBlind;
      }

      if (
        pokerSettings.forcedBetOption === "ANTE" ||
        pokerSettings.forcedBetOption === "BLINDS+ANTE"
      ) {
        amountToSubtract += pokerSettings.ante * tempPokerPlayers.length;
      }

      console.log(`Subtracting ${amountToSubtract} from the total pot amount`);
      pots[0].amount -= amountToSubtract;
    }

    // Function to handle the distribution of bets into pots
    const distributeBetsToPots = (
      bets: { [playerId: string]: { amount: number; dontAddToPot?: boolean } },
      pots: PokerPot[]
    ) => {
      let smallestBet = Number.MAX_VALUE;
      let playersWithBets = Object.entries(bets).filter(
        ([_, bet]) => bet.amount > 0 /* && !bet.dontAddToPot */
      );

      if (playersWithBets.length === 0) {
        return; // No bets to distribute
      }

      // Find the smallest bet among all players
      playersWithBets.forEach(([playerId, bet]) => {
        // chcek if the player folded
        if (tempPokerPlayers.find((player) => player.id === playerId)?.folded) {
          console.log(`Skipped bet ${bet.amount} from ${playerId} because they folded`);
        } else {
          if (bet.amount < smallestBet) {
            smallestBet = bet.amount;
          }
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
      playersWithBets
        .filter(
          ([playerId, _]) =>
            tempPokerPlayers.find((player) => player.id === playerId)?.folded === false
        )
        .forEach(([playerId, bet]) => {
          mainPot.amount += smallestBet;
          bet.amount -= smallestBet;
          if (!mainPot.eligiblePlayers.includes(playerId)) {
            mainPot.eligiblePlayers.push(playerId);
          }
        });

      playersWithBets
        .filter(
          ([playerId, _]) =>
            tempPokerPlayers.find((player) => player.id === playerId)?.folded === true
        )
        .forEach(([playerId, bet]) => {
          mainPot.amount += bet.amount;
          console.log(
            `Took ${bet.amount} from ${playerId} because they folded, now ${mainPot.amount} (was ${
              mainPot.amount - bet.amount
            })`
          );
          bet.amount = 0;
        });

      // Check if there's a need for a side pot
      if (
        playersWithBets
          .filter(
            ([playerId, _]) =>
              tempPokerPlayers.find((player) => player.id === playerId)?.folded === false
          )
          .some(([_, bet]) => bet.amount > 0)
      ) {
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
  ): [PokerGame, PokerPlayer[]] | null => {
    console.log(`(ORDER) Getting next turn data`);
    let tempPokerGame = cloneDeep(_tempPokerGame);
    let tempPokerPlayers = cloneDeep(_tempPokerPlayers);

    const currentPlayerIndex = tempPokerPlayers.findIndex(
      (player) => player.id === tempPokerGame.currentTurn
    );
    tempPokerPlayers[currentPlayerIndex].beenOn = true;

    if (tempPokerGame.gameState === "SHOWDOWN") {
      let nextShowdownPlayerIndex;

      if (!tempPokerPlayers.filter((player) => !player.folded)[0].beenOn) {
        nextShowdownPlayerIndex = tempPokerPlayers.findIndex(
          (player) => player.id == tempPokerPlayers.filter((player) => !player.folded)[0].id
        );
      } else {
        nextShowdownPlayerIndex = currentPlayerIndex + 1;
      }

      // For showdown, we simply go through the list of non-folded players. Once
      // there are no more players to go through, we can end the game (console.log it)

      let availablePlayers = tempPokerPlayers.filter((player) => !player.folded);
      while (true) {
        if (nextShowdownPlayerIndex >= availablePlayers.length) {
          nextShowdownPlayerIndex = -1;
          break;
        }

        if (!availablePlayers[nextShowdownPlayerIndex].folded) {
          break;
        }

        nextShowdownPlayerIndex++;
      }

      if (nextShowdownPlayerIndex == -1) {
        distributePot();

        // We return null so that we don't set the state twice, causing a desync
        return null;
      } else {
        tempPokerGame.currentTurn = tempPokerPlayers[nextShowdownPlayerIndex].id;
        return [tempPokerGame, tempPokerPlayers];
      }
    }

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

      tempPokerGame.pots = tempPokerGame.pots.map((pot) => {
        pot.eligiblePlayers = tempPokerPlayers
          .filter((player) => !player.folded)
          .map((player) => player.id);
        return pot;
      });

      let dealerIndex = tempPokerPlayers.findIndex(
        (player) => player.id == tempPokerGame.currentDealer
      );
      let firstPlayerIndex;
      while (true) {
        dealerIndex = (dealerIndex + 1) % tempPokerPlayers.length;
        if (!tempPokerPlayers[dealerIndex].folded) {
          firstPlayerIndex = dealerIndex;
          break;
        }
      }
      console.log(`(ORDER) First player index: ${firstPlayerIndex}`);

      let ableToPlayPlayers = tempPokerPlayers.filter(
        (player) => !player.folded && !player.allIn
      ).length;
      if (ableToPlayPlayers <= 1) {
        tempPokerGame.gameState = "SHOWDOWN";
        tempPokerGame.runningThroughShowdown = true;
      }

      if (!tempPokerGame.runningThroughShowdown) {
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
            tempPokerGame.currentTurn = tempPokerPlayers.filter((player) => !player.folded)[0].id;
            state = "SHOWDOWN";
            break;
          default:
            throw new Error(`Invalid game state ${tempPokerGame.gameState}`);
        }

        tempPokerGame.gameState = state;
        tempPokerGame.capturingCommunityCards = state !== "SHOWDOWN";
      } else {
        tempPokerGame.gameState = "SHOWDOWN";
        tempPokerGame.capturingCommunityCards = true;

        let showdownPlayerIndex = 0;
        while (tempPokerPlayers[showdownPlayerIndex].folded) {
          showdownPlayerIndex++;

          if (showdownPlayerIndex >= tempPokerPlayers.length) {
            break;
          }
        }
      }

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
    const tempData = getNextTurnData(tempPokerGame, tempPokerPlayers);
    if (!tempData) return;

    tempPokerGame = tempData[0];
    tempPokerPlayers = tempData[1];

    // Remove the folded player from the pots
    let pots = cloneDeep(tempPokerGame.pots);
    pots.forEach((pot) => {
      pot.eligiblePlayers = pot.eligiblePlayers.filter(
        (playerId) => playerId !== tempPokerGame.currentTurn
      );
    });

    tempPokerGame.pots = pots;

    setPokerGame(tempPokerGame);
    setPokerPlayers(tempPokerPlayers);
  };

  const checkAction = () => {
    let tempPokerGame = cloneDeep(pokerGame);
    let tempPokerPlayers = cloneDeep(pokerPlayers);

    let pokerPlayer = {
      ...tempPokerPlayers.find((player) => player.id === tempPokerGame.currentTurn)!,
    };
    let amountToCallTo = tempPokerGame.currentBet - pokerPlayer.currentBet;
    if (amountToCallTo > 0) {
      console.error(`Player ${pokerPlayer.displayName} must call ${amountToCallTo}, and not check`);
      return;
    }

    const tempData = getNextTurnData(tempPokerGame, tempPokerPlayers);
    if (!tempData) return;

    tempPokerGame = tempData[0];
    tempPokerPlayers = tempData[1];

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

    const tempData = getNextTurnData(tempPokerGame, tempPokerPlayers);
    if (!tempData) return;

    tempPokerGame = tempData[0];
    tempPokerPlayers = tempData[1];

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

    const tempData = getNextTurnData(tempPokerGame, tempPokerPlayers);
    if (!tempData) return;
    tempPokerGame = tempData[0];
    tempPokerPlayers = tempData[1];

    tempPokerPlayers[currentPlayerIndex] = {
      ...pokerPlayer,
      beenOn: tempData[1][currentPlayerIndex].beenOn,
    };

    player.balance = round(player.balance - amountToCallTo);
    tempPlayers[tempPlayers.findIndex((p) => p.id === player.id)] = player;

    setPlayers(tempPlayers);
    setPokerGame(tempPokerGame);
    setPokerPlayers(tempPokerPlayers);
  };

  const distributePot = () => {
    if (pokerGame.gameState !== "SHOWDOWN") {
      console.error(`Game state is not SHOWDOWN`);
      return;
    }

    if (!playerHandResults || playerHandResults?.length == 0) {
      console.error(`No player hand results`);
      return;
    }

    let tempPokerPlayers = cloneDeep(pokerPlayers);
    let tempPokerGame = cloneDeep(pokerGame);
    let tempPlayers = cloneDeep(players);

    // Start with the outside pots then work inwards
    let pots = cloneDeep(tempPokerGame.pots);

    const amountWon: { [playerId: string]: number } = {};
    for (const player of tempPokerPlayers) {
      amountWon[player.id] = 0;
    }

    let potResults: {
      [key: number]: {
        // Pot number (0 is Main)
        [playerId: string]: number; // How much each player gets from the pot
      };
    } = {};

    for (let i = pots.length - 1; i >= 0; i--) {
      console.log(`(POT) Distributing pot ${i}`, pots[i]);
      potResults[i] = {};

      let pot = pots[i];
      let eligiblePlayers = pot.eligiblePlayers;
      let totalAmount = pot.amount;

      let activeHands = playerHandResults.filter((result) => eligiblePlayers.includes(result.id));
      console.log(`(POT) Eligible players:`, eligiblePlayers);

      let winner = activeHands.reduce((prev, current) => {
        if (prev.result.win > current.result.win) {
          return prev;
        } else {
          return current;
        }
      });

      console.log(`(POT) Winner:`, winner);

      if (isNaN(totalAmount)) throw new Error(`Total amount is NaN`);

      if (pot.eligiblePlayers.length == 1) {
        console.log(`(POT) Only one player eligible for this pot`);
        potResults[i][pot.eligiblePlayers[0]] = totalAmount;
        amountWon[pot.eligiblePlayers[0]] += totalAmount;
        continue;
      }

      if (winner.result.win == 0) {
        console.log(`(POT) No winner`);
        if (activeHands.some((hand) => hand.result.ties > 0)) {
          let tiedHands = activeHands.filter((hand) => hand.result.ties > 0);
          let tiedAmount = totalAmount / tiedHands.length;

          for (const hand of tiedHands) {
            potResults[i][hand.id] = tiedAmount;
            amountWon[hand.id] += tiedAmount;
          }
        }
      } else {
        console.log(
          `(POT) Winner: ${winner.id} (${winner.result.winPercentage}) won ${formatMoney(
            totalAmount ?? 0
          )}`
        );
        potResults[i][winner.id] = totalAmount;
        amountWon[winner.id] += totalAmount;
      }
    }

    console.log(`(POT) Amount to pay:`, amountWon);

    for (const playerId in amountWon) {
      let player = getPlayer(playerId, tempPlayers)!;
      player.balance = round(player.balance + amountWon[playerId]);
      tempPlayers[tempPlayers.findIndex((p) => p.id === playerId)] = player;
    }

    modals.open({
      title: "Pot Distribution",
      onKeyDown: (event) => {
        if (event.key === "Enter") {
          modals.closeAll();
        }

        // Prevent keybindings from being triggered
        event.stopPropagation();
      },
      children: (
        <>
          <Stack>
            {Object.entries(potResults).map(([potNumber, results]) => {
              return (
                <Container mx={0} px={0}>
                  <Divider
                    my={3}
                    label={potNumber == "0" ? "Main Pot" : `Side Pot ${potNumber}`}
                    labelPosition="left"
                    styles={{
                      label: {
                        fontSize: 14,
                        fontWeight: 600,
                      },
                    }}
                  />
                  {Object.entries(results).map(([playerId, amount]) => {
                    let player = getPlayer(playerId, tempPlayers)!;
                    return (
                      <Paper
                        py={4}
                        px={6}
                        key={playerId}
                        radius="md"
                        style={{
                          backgroundColor: darken(theme.colors.dark[6], 0.2),
                        }}
                      >
                        <Group justify="space-between">
                          <Text>{player.name}</Text>

                          <Text c="green" fw={600}>
                            +{formatMoney(amount)}
                          </Text>
                        </Group>
                      </Paper>
                    );
                  })}
                </Container>
              );
            })}
          </Stack>
        </>
      ),
    });

    setPlayerHandResults(null);
    setPlayers(tempPlayers);
    // End the game
    setPokerGame({
      ...pokerGame,
      communityCards: [EMPTY_CARD, EMPTY_CARD, EMPTY_CARD, EMPTY_CARD, EMPTY_CARD],
      currentBet: 0,
      gameState: "PREROUND",
      currentTurn: "",
      capturingCommunityCards: false,
      runningThroughShowdown: false,
      runningItTwice: false,
      pots: [],
      ...getDealerData(
        pokerPlayers[
          (pokerPlayers.findIndex((player) => player.id == pokerGame.currentDealer) + 1) %
            pokerPlayers.length
        ].id,
        pokerSettings,
        pokerPlayers
      ),
    });

    console.log(amountWon);
  };

  keybindings.forEach((keybinding) => {
    if (keybinding.scope == "Poker Round") {
      useHotkeys(
        keybinding.key,
        (e) => {
          if (betUIOpen) {
            // Disable any keybindings that are used for number input
            if (
              [
                "0",
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                "0",
                "backspace",
                "period",
              ].includes(keybinding.key)
            ) {
              return;
            }
          }

          console.log(`Executing keybinding ${keybinding.key} (${keybinding.action})`);

          e.preventDefault();

          if (betUIOpen && betInputRef.current && document.activeElement === betInputRef.current) {
            if (keybinding.key == "enter") {
              // Bet input is focused and we just got the enter key, so confirm the bet
              betAction(bet);
              setBetUIOpen(false);
              return;
            }
          }

          switch (keybinding.action) {
            case "Check / Call":
              {
                if (betUIOpen) return;

                if (pokerGame.capturingCommunityCards) {
                  let notAllCardsUsed =
                    pokerGame.communityCards.filter((card) => !isAnyEmpty(card)).length <
                    cardsAllowed;
                  if (notAllCardsUsed) {
                    notifications.show({
                      message: "You must add all possible community cards",
                      color: "red",
                    });
                    return;
                  } else {
                    setPokerGame({
                      ...pokerGame,
                      capturingCommunityCards: false,
                    });
                  }
                } else {
                  if (betUIOpen) return;

                  let pokerPlayer = {
                    ...pokerPlayers.find((player) => player.id === pokerGame.currentTurn)!,
                  };

                  let amountToCallTo = pokerGame.currentBet - pokerPlayer.currentBet;
                  if (amountToCallTo > 0) {
                    callAction();
                  } else {
                    checkAction();
                  }
                }
              }
              break;

            case "Bet / Raise":
              {
                if (pokerGame.capturingCommunityCards) return;
                if (betUIOpen) {
                  betAction(bet);
                  setBetUIOpen(false);
                } else {
                  setBetUIOpen(true);

                  setTimeout(() => {
                    (betInputRef as any).current?.focus();
                    (betInputRef as any).current?.setSelectionRange(0, 9999);
                  }, 100);
                }
              }
              break;

            case "All In":
              {
                if (pokerGame.capturingCommunityCards) return;
                if (!betUIOpen) return;
                if (allInConfirm) {
                  const pokerPlayer = pokerPlayers.find(
                    (player) => player.id === pokerGame.currentTurn
                  )!;

                  const player = getPlayer(pokerPlayer.id, players)!;

                  setBet(player.balance);
                  betAction(player.balance);
                  setAllInConfirm(false);
                  setBetUIOpen(false);
                  setTimerStart(null);
                } else {
                  setAllInConfirm(true);

                  setTimerStart(Date.now());
                  setTimeout(() => {
                    setAllInConfirm(false);
                  }, 3000);
                }
              }
              break;

            case "Cancel Bet":
              {
                if (!betUIOpen) return;

                setBetUIOpen(false);
              }
              break;

            case "Fold":
              {
                if (pokerGame.capturingCommunityCards) return;
                if (betUIOpen) return;
                if (foldConfirm) {
                  foldAction();
                  setFoldConfirm(false);
                  setTimerStart(null);
                } else {
                  setFoldConfirm(true);

                  setTimerStart(Date.now());
                  setTimeout(() => {
                    setFoldConfirm(false);
                  }, 3000);
                }
              }
              break;

            case "h":
            case "s":
            case "c":
            case "d":
              {
                if (betUIOpen) return;

                if (cardSelector.opened) {
                  // This functionality is not available for Poker for simplicity
                } else {
                  // Get the last non-empty card and change the suit
                  if (pokerGame.capturingCommunityCards) {
                    let cards = [...pokerGame.communityCards];
                    if (cards.includes(EMPTY_CARD)) {
                      let lastCard = cards[cards.indexOf(EMPTY_CARD) - 1];
                      if (
                        usedCards.includes(`${lastCard[0]}${keybinding.action as CardSuit}` as Card)
                      ) {
                        notifications.show({
                          message: "This card is already in use",
                          color: "red",
                        });
                        return;
                      }
                      cards[cards.indexOf(EMPTY_CARD) - 1] = `${lastCard[0]}${
                        keybinding.action as CardSuit
                      }` as Card;
                    } else {
                      let lastCard = cards[cards.length - 1];
                      if (
                        usedCards.includes(`${lastCard[0]}${keybinding.action as CardSuit}` as Card)
                      ) {
                        notifications.show({
                          message: "This card is already in use",
                          color: "red",
                        });
                        return;
                      }
                      cards[cards.length - 1] = `${lastCard[0]}${
                        keybinding.action as CardSuit
                      }` as Card;
                    }

                    setPokerGame({
                      ...pokerGame,
                      communityCards: cards,
                    });
                  } else {
                    setPokerPlayers((draft) => {
                      let pokerPlayer = draft.find((p) => p.id == pokerGame.currentTurn);

                      if (pokerPlayer) {
                        if (pokerPlayer.cards.includes(EMPTY_CARD)) {
                          let lastCard =
                            pokerPlayer.cards[pokerPlayer.cards.indexOf(EMPTY_CARD) - 1];
                          if (
                            usedCards.includes(
                              `${lastCard[0]}${keybinding.action as CardSuit}` as Card
                            )
                          ) {
                            notifications.show({
                              message: "This card is already in use",
                              color: "red",
                            });
                            return;
                          }
                          pokerPlayer.cards[pokerPlayer.cards.indexOf(EMPTY_CARD) - 1] = `${
                            lastCard[0]
                          }${keybinding.action as CardSuit}` as Card;
                        } else {
                          let lastCard = pokerPlayer.cards[pokerPlayer.cards.length - 1];
                          if (
                            usedCards.includes(
                              `${lastCard[0]}${keybinding.action as CardSuit}` as Card
                            )
                          ) {
                            notifications.show({
                              message: "This card is already in use",
                              color: "red",
                            });
                            return;
                          }
                          pokerPlayer.cards[pokerPlayer.cards.length - 1] = `${lastCard[0]}${
                            keybinding.action as CardSuit
                          }` as Card;
                        }
                      }
                    });
                  }
                }
              }
              break;

            case "A":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
            case "T":
            case "J":
            case "Q":
            case "K":
              {
                if (betUIOpen) return;

                if (cardSelector.opened) {
                  // This functionality is not available for Poker for simplicity
                } else {
                  // When we are dealing with Ranks, we add the card instead of modifying the last one
                  if (pokerGame.capturingCommunityCards) {
                    let newCommunityCards = [...pokerGame.communityCards];
                    if (newCommunityCards.includes(EMPTY_CARD)) {
                      newCommunityCards[newCommunityCards.indexOf(EMPTY_CARD)] = `${
                        keybinding.action as CardRank
                      }${"-"}` as Card;
                    }

                    // Dont allow more cards than the allowed amount
                    if (
                      newCommunityCards.filter((card) => !isCardEmpty(card)).length > cardsAllowed
                    ) {
                      notifications.show({
                        message: "You have already added the maximum amount of cards",
                        color: "red",
                      });
                      return;
                    } else {
                      console.log(
                        `(debug) ${
                          newCommunityCards.filter((card) => !isAnyEmpty(card)).length
                        } vs ${cardsAllowed}`
                      );
                    }

                    // Check all of them [h, s, c, d] instead of just one
                    let allUsed = true;
                    for (let suit of ["h", "s", "c", "d"] as CardSuit[]) {
                      if (!usedCards.includes(`${keybinding.action as CardRank}${suit}` as Card)) {
                        allUsed = false;
                        break;
                      }
                    }

                    if (allUsed) {
                      notifications.show({
                        message: "All suits for this card are already in use",
                        color: "red",
                      });

                      return;
                    }

                    setPokerGame({
                      ...pokerGame,
                      communityCards: newCommunityCards,
                    });
                  } else {
                    setPokerPlayers((draft) => {
                      let pokerPlayer = draft.find((p) => p.id == pokerGame.currentTurn);

                      if (pokerPlayer) {
                        if (pokerPlayer.cards.includes(EMPTY_CARD)) {
                          if (
                            usedCards.includes(`${keybinding.action as CardRank}${"-"}` as Card)
                          ) {
                            notifications.show({
                              message: "This card is already in use",
                              color: "red",
                            });
                            return;
                          }
                          pokerPlayer.cards[pokerPlayer.cards.indexOf(EMPTY_CARD)] = `${
                            keybinding.action as CardRank
                          }${"-"}` as Card;
                        } else {
                          // Texas Hold'em only allows 2 cards per player, however
                          // if in the future we want to allow more cards, we can uncomment this
                          // // blackjackPlayer.cards.push(
                          // //   ${keybinding.action as CardRank}${"-"}` as Card
                          // // );
                        }
                      }
                    });
                  }
                }
              }
              break;

            case "Remove Last Card":
              {
                if (betUIOpen) return;

                if (pokerGame.capturingCommunityCards) {
                  let cards = [...pokerGame.communityCards];
                  let lastIndex = cards.length - 1;
                  while (cards[lastIndex] == EMPTY_CARD) {
                    lastIndex--;

                    if (lastIndex < 0) {
                      break;
                    }
                  }

                  cards[lastIndex] = EMPTY_CARD;

                  setPokerGame({
                    ...pokerGame,
                    communityCards: cards,
                  });
                } else {
                  setPokerPlayers((draft) => {
                    let pokerPlayer = draft.find((p) => p.id == pokerGame.currentTurn);

                    let cards = pokerPlayer!.cards;
                    if (cards.length <= 2) {
                      if (cards[1] == EMPTY_CARD) {
                        cards[0] = EMPTY_CARD;
                      } else {
                        cards[1] = EMPTY_CARD;
                      }
                    } else {
                      cards.pop();
                    }
                  });
                }
              }
              break;

            case "Draw Random Card":
              {
                if (betUIOpen) return;

                if (pokerGame.capturingCommunityCards) {
                  let cards = [...pokerGame.communityCards];
                  if (cards.includes(EMPTY_CARD)) {
                    cards[cards.indexOf(EMPTY_CARD)] = getRandomCard(usedCards);
                  }

                  setPokerGame({
                    ...pokerGame,
                    communityCards: cards,
                  });
                } else {
                  setPokerPlayers((draft) => {
                    let pokerPlayer = draft.find((p) => p.id == pokerGame.currentTurn);

                    if (pokerPlayer) {
                      if (pokerPlayer.cards.includes(EMPTY_CARD)) {
                        pokerPlayer.cards[pokerPlayer.cards.indexOf(EMPTY_CARD)] =
                          getRandomCard(usedCards);
                      } else {
                        // Texas Hold'em only allows 2 cards per player, however
                        // if in the future we want to allow more cards, we can uncomment this
                        // // pokerPlayer.cards.push(card as Card);
                      }
                    }
                  });
                }
              }
              break;
            // default will also cover the specific RankSuit combinations (e.g. "2h", "3s", "4c", "5d")
            default:
              {
                if (betUIOpen) return;

                for (let card of availableCards) {
                  if (keybinding.action == card) {
                    if (cardSelector.opened) {
                      // This functionality is not available for Poker for simplicity
                    } else {
                      // Append the card to the player's hand
                      if (pokerGame.capturingCommunityCards) {
                        let cards = [...pokerGame.communityCards];
                        if (cards.includes(EMPTY_CARD)) {
                          cards[cards.indexOf(EMPTY_CARD)] = card;
                        }

                        setPokerGame({
                          ...pokerGame,
                          communityCards: cards,
                        });
                      } else {
                        setPokerPlayers((draft) => {
                          let pokerPlayer = draft.find((p) => p.id == pokerGame.currentTurn);

                          if (pokerPlayer) {
                            if (pokerPlayer.cards.includes(EMPTY_CARD)) {
                              pokerPlayer.cards[pokerPlayer.cards.indexOf(EMPTY_CARD)] =
                                card as Card;
                            } else {
                              // Texas Hold'em only allows 2 cards per player, however
                              // if in the future we want to allow more cards, we can uncomment this
                              // // pokerPlayer.cards.push(card as Card);
                            }
                          }
                        });
                      }
                    }
                  }
                }
              }
              break;
          }
        },
        {
          enableOnFormTags: ["INPUT"],
        }
      );
    }
  });

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
        <CommunityCards cardsAllowed={cardsAllowed} distributePot={distributePot} />
        {pokerPlayers.map((pokerPlayer) => {
          return (
            <div
              style={{
                opacity: pokerPlayer.folded ? 0.25 : 1,
                filter: pokerPlayer.folded ? "blur(1.5px)" : "none",
              }}
              key={pokerPlayer.id}
            >
              <RoundPlayerCard
                ref={betInputRef}
                player={getPlayer(pokerPlayer.id, players)!}
                pokerPlayer={pokerPlayer}
                active={
                  pokerPlayer.id === pokerGame.currentTurn && !pokerGame.capturingCommunityCards
                }
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
