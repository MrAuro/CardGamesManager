import { KEYBINDINGS_STATE, PLAYERS_STATE, POKER_GAME_STATE, POKER_PLAYERS_STATE } from "@/Root";
import CardSelector from "@/components/CardSelector";
import { CARD_SELECTOR_STATE } from "@/pages/Blackjack/routes/Round";
import { Card, CardRank, CardSuit } from "@/types/Card";
import { availableCards } from "@/types/Keybindings";
import { GameState, PokerGame, PokerPlayer, PokerPot } from "@/types/Poker";
import { EMPTY_CARD, isAnyEmpty } from "@/utils/CardHelper";
import { round } from "@/utils/MoneyHelper";
import { getPlayer } from "@/utils/PlayerHelper";
import { useRecoilImmerState } from "@/utils/RecoilImmer";
import { Button, Flex } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import cloneDeep from "lodash/cloneDeep";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { atom, useRecoilState } from "recoil";
import CommunityCards from "../components/CommunityCards";
import RoundPlayerCard from "../components/RoundPlayerCard";

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

export default function Round() {
  const [pokerGame, setPokerGame] = useRecoilState(POKER_GAME_STATE);

  const [pokerPlayers, setPokerPlayers] = useRecoilImmerState(POKER_PLAYERS_STATE);
  const [players, setPlayers] = useRecoilImmerState(PLAYERS_STATE);
  const [cardSelector, setCardSelector] = useRecoilState(CARD_SELECTOR_STATE);
  const [activeCardOverride, setActiveCardOverride] = useState<Card | undefined>(undefined);
  const [keybindings] = useRecoilImmerState(KEYBINDINGS_STATE);

  // !
  const [foldConfirm, setFoldConfirm] = useRecoilState(FOLD_CONFIRM);
  const [allInConfirm, setAllInConfirm] = useRecoilState(ALLIN_CONFIRM);
  const [bet, setBet] = useRecoilState(PLAYER_BET);
  const [betUIOpen, setBetUIOpen] = useRecoilState(BETUI_OPEN);
  const [, setTimerStart] = useRecoilState(TIMER_START);
  // !

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

    if (tempPokerGame.gameState === "SHOWDOWN") {
      // For showdown, we simply go through the list of non-folded players. Once
      // there are no more players to go through, we can end the game (console.log it)

      let showdownPlayerIndex = currentPlayerIndex + 1;
      while (showdownPlayerIndex == -1 || tempPokerPlayers[showdownPlayerIndex].folded) {
        showdownPlayerIndex++;

        if (showdownPlayerIndex >= tempPokerPlayers.length) {
          showdownPlayerIndex = -1;
          break;
        }
      }

      if (showdownPlayerIndex == -1) {
        alert("Game over");
        return [tempPokerGame, tempPokerPlayers];
      } else {
        tempPokerGame.currentTurn = tempPokerPlayers[showdownPlayerIndex].id;
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
    const [_tempPokerGame, _tempPokerPlayers] = getNextTurnData(tempPokerGame, tempPokerPlayers);
    tempPokerGame = _tempPokerGame;
    tempPokerPlayers = _tempPokerPlayers;

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

  keybindings.forEach((keybinding) => {
    if (keybinding.scope == "Poker Round") {
      useHotkeys(keybinding.key, (e) => {
        e.preventDefault();

        switch (keybinding.action) {
          case "Check / Call":
            {
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
              if (cardSelector.opened) {
                setActiveCardOverride(`${"-"}${keybinding.action as CardSuit}`);
              } else {
                // Get the last non-empty card and change the suit
                if (pokerGame.capturingCommunityCards) {
                  let cards = [...pokerGame.communityCards];
                  if (cards.includes(EMPTY_CARD)) {
                    let lastCard = cards[cards.indexOf(EMPTY_CARD) - 1];
                    cards[cards.indexOf(EMPTY_CARD) - 1] = `${lastCard[0]}${
                      keybinding.action as CardSuit
                    }` as Card;
                  } else {
                    let lastCard = cards[cards.length - 1];
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
                        let lastCard = pokerPlayer.cards[pokerPlayer.cards.indexOf(EMPTY_CARD) - 1];
                        pokerPlayer.cards[pokerPlayer.cards.indexOf(EMPTY_CARD) - 1] = `${
                          lastCard[0]
                        }${keybinding.action as CardSuit}` as Card;
                      } else {
                        let lastCard = pokerPlayer.cards[pokerPlayer.cards.length - 1];
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
              if (cardSelector.opened) {
                setActiveCardOverride(`${keybinding.action as CardRank}${"-"}`);
              } else {
                // When we are dealing with Ranks, we add the card instead of modifying the last one
                if (pokerGame.capturingCommunityCards) {
                  let newCommunityCards = [...pokerGame.communityCards];
                  if (newCommunityCards.includes(EMPTY_CARD)) {
                    newCommunityCards[newCommunityCards.indexOf(EMPTY_CARD)] = `${
                      keybinding.action as CardRank
                    }${"-"}` as Card;
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

          // default will also cover the specific RankSuit combinations (e.g. "2h", "3s", "4c", "5d")
          default:
            {
              for (let card of availableCards) {
                if (keybinding.action == card) {
                  if (cardSelector.opened) {
                    setActiveCardOverride(card);
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
                            pokerPlayer.cards[pokerPlayer.cards.indexOf(EMPTY_CARD)] = card as Card;
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
      });
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
        <CommunityCards cardsAllowed={cardsAllowed} />
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
                active={
                  pokerPlayer.id === pokerGame.currentTurn && !pokerGame.capturingCommunityCards
                }
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
