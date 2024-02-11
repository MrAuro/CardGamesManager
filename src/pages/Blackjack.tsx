import { Box, Button, Divider, Group, Paper, Text, Title, rem } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconArrowsShuffle } from "@tabler/icons-react";
import { GetRecommendedPlayerAction } from "blackjack-strategy";
import _ from "lodash";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useRecoilState } from "recoil";
import { STATE, State } from "../App";
import CardPicker from "../components/CardPicker";
import DealerItem from "../components/DealerItem";
import PlayerListItem from "../components/PlayerListItem";
import PlayerSelector from "../components/PlayingList";
import { Player } from "../types/Player";
import {
  BlackjackPlayer,
  findPerfectPairs,
  findTwentyOnePlusThree,
  getCardTotal,
  getPlayer,
} from "../utils/BlackjackHelper";
import { Card, CardRank, CardSuit, EMPTY_CARD, getRank, getRankInt } from "../utils/CardHelper";
import { useCustomRecoilState } from "../utils/RecoilHelper";

export default function Blackjack() {
  const [state, setState, modifyState] = useCustomRecoilState<State>(STATE);
  const [betErrors, setBetErrors] = useState<{ id: string; msg: string }[]>([]);
  const [sideBetErrors, setSideBetErrors] = useState<
    { id: string; msg: string; sideBet: string }[]
  >([]);
  const [playerTotalBetErrors, setPlayerTotalBetErrors] = useState<{ id: string; msg: string }[]>(
    []
  );

  const [zeroHeld, setZeroHeld] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const [firstRender, setFirstRender] = useState(true);
  useMemo(() => {
    if (firstRender) {
      setFirstRender(false);
    }
  }, []);

  // Removes bet errors when a player is removed
  useEffect(() => {
    let newBetErrors: { id: string; msg: string }[] = [];
    for (let error of betErrors) {
      if (state.blackjack.players.find((p) => p.id === error.id)) {
        newBetErrors.push(error);
      }
    }

    // setBetErrors(newBetErrors);
    // check if the newBetErrors are different from the old ones
    let identical = true;
    if (newBetErrors.length !== betErrors.length) {
      identical = false;
    } else {
      for (let i = 0; i < newBetErrors.length; i++) {
        if (newBetErrors[i].id !== betErrors[i].id || newBetErrors[i].msg !== betErrors[i].msg) {
          identical = false;
          break;
        }
      }
    }

    if (!identical) {
      setBetErrors(newBetErrors);
    }
  }, [betErrors]);

  // Removes side bet errors when a player is removed or a side bet is disabled
  useEffect(() => {
    let newSideBetErrors: { id: string; msg: string; sideBet: string }[] = [];
    for (let error of sideBetErrors) {
      if (state.blackjack.players.find((p) => p.id === error.id)) {
        if (error.sideBet === "21+3" && !state.blackjack.sideBets.twentyOnePlusThree) {
          console.log("21+3 side bet is disabled, removing error");
          continue;
        }

        if (error.sideBet === "perfectPairs" && !state.blackjack.sideBets.perfectPairs) {
          console.log("Perfect pairs side bet is disabled, removing error");
          continue;
        }

        if (error.sideBet === "betBehind" && !state.blackjack.sideBets.betBehind) {
          console.log("Bet behind side bet is disabled, removing error");
          continue;
        }

        newSideBetErrors.push(error);
      }
    }

    // setBetErrors(newBetErrors);
    // check if the newBetErrors are different from the old ones
    let identical = true;
    if (newSideBetErrors.length !== sideBetErrors.length) {
      identical = false;
    } else {
      for (let i = 0; i < newSideBetErrors.length; i++) {
        if (
          newSideBetErrors[i].id !== sideBetErrors[i].id ||
          newSideBetErrors[i].msg !== sideBetErrors[i].msg
        ) {
          identical = false;
          break;
        }
      }
    }

    if (!identical) {
      console.log(`Modifying side bet errors`);
      setBetErrors(newSideBetErrors);
    }
  }, [sideBetErrors, state.blackjack.sideBets]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "0") {
        setZeroHeld(true);
      }

      if (!state.useKeybindings || modalOpen || state.activeTab !== "BLACKJACK") return;

      if (event.repeat) return;

      let currentTurnPlayer = state.blackjack.players.find((p) => p.id === state.blackjack.turn);
      let val;
      switch (event.key) {
        case "1":
        case ".":
          val = "A";
          break;

        case "2":
          val = "2";
          break;

        case "3":
          val = "3";
          break;

        case "4":
          val = "4";
          break;

        case "5":
          val = "5";
          break;

        case "6":
          val = "6";
          break;

        case "7":
          val = "7";
          break;

        case "8":
          val = "8";
          break;

        case "9":
          console.log("9 pressed");
          val = "9";
          break;

        case "0":
          val = "T";
          break;

        case "Tab":
          {
            if (state.blackjack.state == "PLAYING") {
              if (zeroHeld) {
                // Tab through T, J, Q, K
                let ranks = ["T", "J", "Q", "K"] as CardRank[];

                if (currentTurnPlayer != null) {
                  let cards = [...currentTurnPlayer.cards];
                  let activeCard: Card;
                  let activeCardIndex;
                  if (currentTurnPlayer.cards.length <= 2) {
                    if (cards[1] == EMPTY_CARD) {
                      activeCard = cards[0];
                      activeCardIndex = 0;
                    } else {
                      activeCard = cards[1];
                      activeCardIndex = 1;
                    }
                  } else {
                    activeCard = cards[cards.length - 1];
                    activeCardIndex = cards.length - 1;
                  }

                  if (activeCard == EMPTY_CARD) {
                    event.preventDefault();
                    return;
                  }

                  let activeRank = getRank(activeCard);
                  let nextRankIndex = ranks.indexOf(activeRank) + 1;
                  if (nextRankIndex >= ranks.length) {
                    nextRankIndex = 0;
                  }

                  let newCard = ranks[nextRankIndex] + activeCard.slice(-1);
                  cards[activeCardIndex] = newCard as Card;

                  setState({
                    ...state,
                    blackjack: {
                      ...state.blackjack,
                      players: state.blackjack.players.map((p) => {
                        if (p.id === currentTurnPlayer!.id) {
                          return {
                            ...p,
                            cards: cards,
                            doubledDown: false,
                          };
                        }
                        return p;
                      }),
                    },
                  });
                } else if (state.blackjack.turn === "DEALER") {
                  let dealerCards = [...state.blackjack.dealerCards];
                  let activeCard: Card;
                  let activeCardIndex;
                  if (state.blackjack.dealerCards.length <= 2) {
                    if (dealerCards[1] == EMPTY_CARD) {
                      activeCard = dealerCards[0];
                      activeCardIndex = 0;
                    } else {
                      activeCard = dealerCards[1];
                      activeCardIndex = 1;
                    }
                  } else {
                    activeCard = dealerCards[dealerCards.length - 1];
                    activeCardIndex = dealerCards.length - 1;
                  }

                  if (activeCard == EMPTY_CARD) {
                    event.preventDefault();
                    return;
                  }

                  let activeRank = getRank(activeCard);
                  let nextRankIndex = ranks.indexOf(activeRank) + 1;
                  if (nextRankIndex >= ranks.length) {
                    nextRankIndex = 0;
                  }

                  let newCard = ranks[nextRankIndex] + activeCard.slice(-1);
                  dealerCards[activeCardIndex] = newCard as Card;

                  setState({
                    ...state,
                    blackjack: {
                      ...state.blackjack,
                      dealerCards: dealerCards,
                    },
                  });
                }
                event.preventDefault();
              } else {
                // Goes to the next suit
                let suits = ["h", "d", "s", "c"] as CardSuit[];

                if (currentTurnPlayer != null) {
                  let cards = [...currentTurnPlayer.cards];
                  let activeCard: Card;
                  let activeCardIndex;
                  if (currentTurnPlayer.cards.length <= 2) {
                    if (cards[1] == EMPTY_CARD) {
                      activeCard = cards[0];
                      activeCardIndex = 0;
                    } else {
                      activeCard = cards[1];
                      activeCardIndex = 1;
                    }
                  } else {
                    activeCard = cards[cards.length - 1];
                    activeCardIndex = cards.length - 1;
                  }

                  if (activeCard == EMPTY_CARD) {
                    event.preventDefault();
                    return;
                  }

                  let activeSuit = activeCard.slice(-1) as CardSuit;
                  let nextSuitIndex = suits.indexOf(activeSuit) + 1;
                  if (nextSuitIndex >= suits.length) {
                    nextSuitIndex = 0;
                  }

                  let newCard = activeCard.slice(0, -1) + suits[nextSuitIndex];

                  cards[activeCardIndex] = newCard as Card;

                  // modifyState does not work here for some reason
                  setState({
                    ...state,
                    blackjack: {
                      ...state.blackjack,
                      players: state.blackjack.players.map((p) => {
                        if (p.id === currentTurnPlayer!.id) {
                          return {
                            ...p,
                            cards: cards,
                            doubledDown: false,
                          };
                        }
                        return p;
                      }),
                    },
                  });
                } else if (state.blackjack.turn === "DEALER") {
                  let dealerCards = [...state.blackjack.dealerCards];
                  let activeCard: Card;
                  let activeCardIndex;
                  if (state.blackjack.dealerCards.length <= 2) {
                    if (dealerCards[1] == EMPTY_CARD) {
                      activeCard = dealerCards[0];
                      activeCardIndex = 0;
                    } else {
                      activeCard = dealerCards[1];
                      activeCardIndex = 1;
                    }
                  } else {
                    activeCard = dealerCards[dealerCards.length - 1];
                    activeCardIndex = dealerCards.length - 1;
                  }

                  if (activeCard == EMPTY_CARD) {
                    event.preventDefault();
                    return;
                  }

                  let activeSuit = activeCard.slice(-1) as CardSuit;
                  let nextSuitIndex = suits.indexOf(activeSuit) + 1;
                  if (nextSuitIndex >= suits.length) {
                    nextSuitIndex = 0;
                  }

                  let newCard = activeCard.slice(0, -1) + suits[nextSuitIndex];
                  dealerCards[activeCardIndex] = newCard as Card;

                  setState({
                    ...state,
                    blackjack: {
                      ...state.blackjack,
                      dealerCards: dealerCards,
                    },
                  });
                }
                event.preventDefault(); // Prevents tabbing to the next focusable element
              }
            }
          }
          break;

        case "Enter":
          {
            if (state.blackjack.state == "PLAYING" && state.activeTab == "BLACKJACK") {
              // Stands
              if (state.blackjack.turn !== "DEALER") nextTurn();

              if (state.blackjack.turn === "DEALER") {
                if (state.blackjack.firstRound) {
                  modifyState({
                    blackjack: {
                      turn: state.blackjack.players[0].id,
                      firstRound: false,
                    },
                  });
                } else {
                  payoutAndEndGame();
                }
              }
            } else if (state.blackjack.state === "NONE") {
              if (
                state.blackjack.players.length <= 0 ||
                betErrors.filter((p) => p !== null).length > 0 ||
                sideBetErrors.length > 0 ||
                playerTotalBetErrors.length > 0
              ) {
                alert("There are errors in the game, please fix them before starting");
              } else {
                startGame();
              }
            }
          }
          break;

        case "Backspace":
          {
            if (currentTurnPlayer != null) {
              let cards = [...currentTurnPlayer.cards];
              if (currentTurnPlayer.cards.length <= 2) {
                if (cards[1] == EMPTY_CARD) {
                  cards[0] = EMPTY_CARD;
                } else {
                  cards[1] = EMPTY_CARD;
                }
              } else {
                cards.pop();
              }

              // modifyState does not work here for some reason
              setState({
                ...state,
                blackjack: {
                  ...state.blackjack,
                  players: state.blackjack.players.map((p) => {
                    if (p.id === currentTurnPlayer!.id) {
                      return {
                        ...p,
                        cards: cards,
                        doubledDown: false,
                      };
                    }
                    return p;
                  }),
                },
              });
            } else if (state.blackjack.turn === "DEALER") {
              let dealerCards = [...state.blackjack.dealerCards];
              if (state.blackjack.dealerCards.length <= 2) {
                if (dealerCards[1] == EMPTY_CARD) {
                  dealerCards[0] = EMPTY_CARD;
                } else {
                  dealerCards[1] = EMPTY_CARD;
                }
              } else {
                dealerCards.pop();
              }

              setState({
                ...state,
                blackjack: {
                  ...state.blackjack,
                  dealerCards: dealerCards,
                },
              });
            }
          }
          break;

        case "-":
          {
            if (
              currentTurnPlayer != null &&
              !(
                currentTurnPlayer.doubledDown ||
                currentTurnPlayer.cards.filter((card) => card !== EMPTY_CARD).length !== 2 ||
                getRank(currentTurnPlayer.cards[0]) !== getRank(currentTurnPlayer.cards[1]) ||
                currentTurnPlayer.split ||
                currentTurnPlayer.bet > getPlayer(currentTurnPlayer.id, state.players).balance
              )
            ) {
              console.log("KBD Playing can split, splitting");
              playerSplit(currentTurnPlayer);
            }
          }
          break;

        case "*":
          {
            if (
              currentTurnPlayer != null &&
              !(
                currentTurnPlayer.cards.length > 2 ||
                currentTurnPlayer.doubledDown ||
                getPlayer(currentTurnPlayer.id, state.players).balance < currentTurnPlayer.bet
              )
            ) {
              console.log("KBD Playing can double down, doubling down");
              doubleDown(currentTurnPlayer);
            }
          }
          break;
      }

      if (val != null) {
        // let randomSuit = (["h", "s", "d", "c"] as CardSuit[])[Math.floor(Math.random() * 4)];
        let rank: CardRank = val as CardRank;
        let card: Card = `${rank}-` as Card;

        if (currentTurnPlayer != null) {
          let cards = [...currentTurnPlayer.cards];
          if (!cards.includes(EMPTY_CARD) && !currentTurnPlayer.doubledDown) {
            cards.push(EMPTY_CARD);
          }
          let index = cards.indexOf(EMPTY_CARD);
          cards[index] = card;
          modifyState({
            blackjack: {
              players: state.blackjack.players.map((p) => {
                if (currentTurnPlayer != null) {
                  if (p.id === currentTurnPlayer.id) {
                    return {
                      ...p,
                      cards: cards,
                    };
                  }
                  return p;
                } else {
                  console.warn("currentTurnPlayer is null - this should never happen");
                }
              }),
            },
          });
        } else if (state.blackjack.turn === "DEALER") {
          let dealerCards = [...state.blackjack.dealerCards];
          if (!dealerCards.includes(EMPTY_CARD)) {
            dealerCards.push(EMPTY_CARD);
          }
          let index = dealerCards.indexOf(EMPTY_CARD);
          dealerCards[index] = card;
          modifyState({
            blackjack: {
              dealerCards: dealerCards,
            },
          });
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "0") {
        setZeroHeld(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [state, modalOpen, zeroHeld]);

  useKeyPress((event) => {
    console.log(event.key);
    //
  });

  const [showCardPicker, setShowCardPicker] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [cardPlayer, setCardPlayer] = useState("");

  const payoutAndEndGame = () => {
    let dealerTotal = getCardTotal(state.blackjack.dealerCards);
    let players = state.blackjack.players;
    let newBasePlayers = [...state.players];

    let resultStrings: string[] = [];

    for (let player of players) {
      let playerTotal = getCardTotal(player.cards);
      let basePlayer: Player = {
        ...getPlayer(player.splitFrom || player.id, newBasePlayers),
      };
      let payout = 0;
      let result: "BLACKJACK" | "WIN" | "LOSE" | "PUSH" = "LOSE";

      if (playerTotal.total > 21) {
        result = "LOSE";
      } else if (dealerTotal.total == playerTotal.total) {
        result = "PUSH";
      } else if (playerTotal.total == 21) {
        result = "BLACKJACK";
      } else if (dealerTotal.total > 21) {
        result = "WIN";
      } else if (dealerTotal.total > playerTotal.total) {
        result = "LOSE";
      } else if (dealerTotal.total < playerTotal.total) {
        result = "WIN";
      }

      let bet = player.doubledDown ? player.bet * 2 : player.bet;
      if (result == "BLACKJACK") {
        payout = bet * 1.5;
      } else if (result == "WIN") {
        payout = bet;
      } else if (result == "PUSH") {
        payout = bet;
      }

      if (result == "WIN" || result == "BLACKJACK") {
        basePlayer.balance += payout; // Add the bet back
      }

      if (
        state.blackjack.sideBets.perfectPairs &&
        player.sidebets.perfectPairs != null &&
        player.sidebets.perfectPairs > 0
      ) {
        let _payout = 0;
        let perfectPairsPayout = findPerfectPairs(player.cards);
        switch (perfectPairsPayout) {
          case "None":
            break;

          case "Mixed":
            _payout = player.sidebets.perfectPairs * 5;
            break;

          case "Colored":
            _payout = player.sidebets.perfectPairs * 10;
            break;

          case "Perfect":
            _payout = player.sidebets.perfectPairs * 30;
            break;
        }

        basePlayer.balance += _payout;
        resultStrings.push(`${basePlayer.name} won $${_payout.toFixed(2)} from Perfect Pairs`);
      }

      if (
        state.blackjack.sideBets.twentyOnePlusThree &&
        player.sidebets.twentyOnePlusThree != null &&
        player.sidebets.twentyOnePlusThree > 0
      ) {
        let _payout = 0;
        let twentyOnePlusThreePayout = findTwentyOnePlusThree([
          player.cards[0],
          player.cards[1],
          state.blackjack.dealerCards[0],
        ]);
        switch (twentyOnePlusThreePayout) {
          case "None":
            break;

          case "Flush":
            _payout = player.sidebets.twentyOnePlusThree * 5;
            break;

          case "Straight":
            _payout = player.sidebets.twentyOnePlusThree * 10;
            break;

          case "Three of a Kind":
            _payout = player.sidebets.twentyOnePlusThree * 30;
            break;

          case "Straight Flush":
            _payout = player.sidebets.twentyOnePlusThree * 40;
            break;

          case "Suited Three of a Kind":
            _payout = player.sidebets.twentyOnePlusThree * 100;
            break;
        }

        basePlayer.balance += _payout;
        resultStrings.push(`${basePlayer.name} won $${_payout.toFixed(2)} from 21+3`);
      }

      if (
        state.blackjack.sideBets.betBehind &&
        player.sidebets.betBehind != null &&
        player.sidebets.betBehind.bet != null &&
        player.sidebets.betBehind.bet > 0 &&
        player.sidebets.betBehind.target != null
      ) {
        let betBehindPayout = 0;
        let betBehindPlayerResult: "BLACKJACK" | "WIN" | "LOSE" | "PUSH" = "LOSE";

        if (playerTotal.total > 21) {
          betBehindPlayerResult = "LOSE";
        } else if (dealerTotal.total == playerTotal.total) {
          betBehindPlayerResult = "PUSH";
        } else if (playerTotal.total == 21) {
          betBehindPlayerResult = "BLACKJACK";
        } else if (dealerTotal.total > 21) {
          betBehindPlayerResult = "WIN";
        } else if (dealerTotal.total > playerTotal.total) {
          betBehindPlayerResult = "LOSE";
        } else if (dealerTotal.total < playerTotal.total) {
          betBehindPlayerResult = "WIN";
        }

        let betBehindBet = player.sidebets.betBehind.bet;
        if (betBehindPlayerResult == "BLACKJACK") {
          betBehindPayout = betBehindBet * 1.5;
        } else if (betBehindPlayerResult == "WIN") {
          betBehindPayout = betBehindBet;
        } else if (betBehindPlayerResult == "PUSH") {
          betBehindPayout = betBehindBet;
        }

        if (betBehindPlayerResult == "WIN" || betBehindPlayerResult == "BLACKJACK") {
          basePlayer.balance += betBehindPayout; // Add the bet back
        }

        if (betBehindPlayerResult == "WIN" || betBehindPlayerResult == "BLACKJACK") {
          resultStrings.push(
            `${basePlayer.name} won $${betBehindPayout.toFixed(2)} from bet behind ${
              getPlayer(player.sidebets.betBehind.target!, state.players).name
            }`
          );
        }
      }

      basePlayer.balance += payout;
      switch (result) {
        case "BLACKJACK":
          resultStrings.push(`${basePlayer.name} got blackjack and won $${payout.toFixed(2)}`);
          break;

        case "WIN":
          resultStrings.push(`${basePlayer.name} won $${payout.toFixed(2)}`);
          break;

        case "LOSE":
          resultStrings.push(`${basePlayer.name} lost $${bet.toFixed(2)}`);
          break;

        case "PUSH":
          resultStrings.push(`${basePlayer.name} pushed`);
          break;
      }

      newBasePlayers = newBasePlayers.map((p) => {
        if (p.id === basePlayer.id) {
          return basePlayer;
        }
        return p;
      });
    }

    setModalOpen(true);
    modals.open({
      title: "Payouts",
      onClose: () => {
        setModalOpen(false);
      },
      children: (
        <>
          {resultStrings.map((str) => {
            return <Text key={str}>{str}</Text>;
          })}
        </>
      ),
    });

    let newPastSeenCards: Card[] = [];
    if (state?.blackjack?.pastGameSeenCards?.length > 0) {
      newPastSeenCards = [...state.blackjack.pastGameSeenCards];
      for (let card of state.blackjack.seenCards) {
        newPastSeenCards.push(card);
      }
    } else {
      newPastSeenCards = [...state.blackjack.seenCards];
    }

    setState({
      ...state,
      players: newBasePlayers,
      blackjack: {
        state: "NONE",
        turn: "",
        dealerCards: [EMPTY_CARD, EMPTY_CARD],
        firstRound: true,
        players: state.blackjack.players
          .filter((p) => p.splitFrom == null)
          .map((p) => {
            return {
              ...p,
              cards: [EMPTY_CARD, EMPTY_CARD],
              doubledDown: false,
              split: false,
              handPartialResult: undefined,
              handResult: undefined,
              sidebets: {
                twentyOnePlusThree: p.sidebets.twentyOnePlusThree,
                perfectPairs: p.sidebets.perfectPairs,
                betBehind: {
                  bet: p.sidebets.betBehind.bet,
                  target: p.sidebets.betBehind.target,
                },
              },
            };
          }),
        deckCount: state.blackjack.deckCount,
        runningCount: state.blackjack.runningCount,
        seenCards: [],
        pastGameSeenCards: newPastSeenCards,
        sideBets: {
          ...state.blackjack.sideBets,
        },
      },
    });
  };

  const doubleDown = (player: BlackjackPlayer) => {
    modifyState({
      blackjack: {
        players: state.blackjack.players.map((p) => {
          if (p.id === player.id) {
            let cards = [...p.cards];
            cards.push(EMPTY_CARD);
            return {
              ...p,
              cards,
              doubledDown: true,
            };
          }
          return p;
        }),
      },
    });
  };

  const checkForBetErrors = (player: Player) => {
    if (player == null) return;

    console.log("Checking for bet errors", player.id, player.balance);

    let foundErrs = false;
    let bet = state.blackjack.players.find((p) => p.id === player.id)?.bet;
    if (bet == null) return;

    if (isNaN(bet)) {
      foundErrs = true;
      setBetErrors([
        ...betErrors,
        {
          id: player.id,
          msg: "Invalid bet amount",
        },
      ]);
    }

    // We allow 0 bets in case the player doesnt want to bet but still wants to play
    if (bet == 0) {
      setBetErrors(betErrors.filter((e) => e.id !== player!.id));
      return;
    }

    if (bet < 0) {
      foundErrs = true;

      setBetErrors([
        ...betErrors,
        {
          id: player.id,
          msg: "Bet amount cannot be negative",
        },
      ]);
    }

    if (bet > player.balance) {
      foundErrs = true;

      setBetErrors([
        ...betErrors,
        {
          id: player.id,
          msg: "Insufficient funds",
        },
      ]);
    }

    if (!foundErrs) {
      setBetErrors(betErrors.filter((e) => e.id !== player!.id));
    }
  };

  const checkForSideBetErrors = (
    player: BlackjackPlayer,
    sideBets: string[] = ["Perfect Pairs", "21+3", "Bet Behind"],
    value: number,
    returnErrors: boolean = false
  ): void | any[] => {
    let _player = getPlayer(player.id, state.players);
    let fakeState: any[] = [];
    for (let sideBet of sideBets) {
      let foundErrs = false;
      let prevErr = false;
      sideBetErrors.forEach((e) => {
        if (e.id === _player!.id && e.sideBet === sideBet) {
          prevErr = true;
        }
      });

      let bet = parseFloat(`${value}`);
      if (isNaN(bet)) {
        foundErrs = true;

        if (!prevErr) {
          if (returnErrors) {
            fakeState.push({
              id: _player!.id,
              msg: "Invalid bet amount",
              sideBet: sideBet,
            });
          }
          setSideBetErrors([
            ...sideBetErrors,
            {
              id: _player!.id,
              msg: "Invalid bet amount",
              sideBet: sideBet,
            },
          ]);
        }
      }

      if (bet < 0) {
        foundErrs = true;

        if (!prevErr) {
          if (returnErrors) {
            fakeState.push({
              id: _player!.id,
              msg: "Bet amount cannot be negative",
              sideBet: sideBet,
            });
          } else {
            setSideBetErrors([
              ...sideBetErrors,
              {
                id: _player!.id,
                msg: "Bet amount cannot be negative",
                sideBet: sideBet,
              },
            ]);
          }
        }
      }

      if (bet > _player.balance) {
        foundErrs = true;

        if (!prevErr) {
          if (returnErrors) {
            fakeState.push({
              id: _player!.id,
              msg: "Insufficient funds",
              sideBet: sideBet,
            });
          }
        } else {
          setSideBetErrors([
            ...sideBetErrors,
            {
              id: _player!.id,
              msg: "Insufficient funds",
              sideBet: sideBet,
            },
          ]);
        }
      }

      if (!foundErrs) {
        if (returnErrors) {
          fakeState = fakeState.filter((e) => e.id !== _player!.id || e.sideBet !== sideBet);
        } else {
          const filteredBetErrors = sideBetErrors.filter(
            (sideBetError) => sideBetError.id !== _player!.id || sideBetError.sideBet !== sideBet
          );

          setSideBetErrors(filteredBetErrors);
        }
      }
    }

    if (returnErrors) {
      return fakeState;
    }
  };

  if (firstRender) {
    if (state.blackjack.state == "NONE") {
      /*
        This is kind of hacky, but it works. Instead of updating the state directly, 
        we push the errors to an array and then set the state at the end. This is done 
        because otherwise the state would be overwritten by the next iteration of the loop
      */
      let _sideBetErrors = [];
      let _totalBetErrors = [];

      for (let i = state.blackjack.players.length - 1; i >= 0; i--) {
        let total = state.blackjack.players[i].bet;

        let player = state.blackjack.players[i];
        checkForBetErrors(getPlayer(player.id, state.players));

        if (state.blackjack.sideBets.perfectPairs) {
          let perfectPairs = checkForSideBetErrors(
            player,
            ["Perfect Pairs"],
            player.sidebets.perfectPairs || 0,
            true
          );

          for (let err of perfectPairs as any[]) {
            _sideBetErrors.push(err);
          }

          total += player.sidebets.perfectPairs || 0;
        }

        if (state.blackjack.sideBets.twentyOnePlusThree) {
          let twentyOnePlusThree = checkForSideBetErrors(
            player,
            ["21+3"],
            player.sidebets.twentyOnePlusThree || 0,
            true
          );

          for (let err of twentyOnePlusThree as any[]) {
            _sideBetErrors.push(err);
          }

          total += player.sidebets.twentyOnePlusThree || 0;
        }

        if (state.blackjack.sideBets.betBehind) {
          let betBehind = checkForSideBetErrors(
            player,
            ["Bet Behind"],
            player.sidebets.betBehind.bet || 0,
            true
          );

          for (let err of betBehind as any[]) {
            _sideBetErrors.push(err);
          }

          total += player.sidebets.betBehind.bet || 0;
        }

        if (total > getPlayer(player.id, state.players).balance) {
          _totalBetErrors.push({
            id: player.id,
            msg: "Total bet exceeds balance",
          });
        }
      }

      setSideBetErrors(_sideBetErrors);
      setPlayerTotalBetErrors(_totalBetErrors);
    }
  }

  const refundAndEndGame = () => {
    // Game has been canceled. Refund players all their bets
    let players = state.blackjack.players;
    let newBasePlayers = [...state.players];

    let resultStrings: string[] = [];

    for (let player of players) {
      let basePlayer: Player = {
        ...getPlayer(player.splitFrom || player.id, newBasePlayers),
      };
      basePlayer.balance += player.bet;
      if (state.blackjack.sideBets.perfectPairs) {
        basePlayer.balance += player.sidebets.perfectPairs || 0;
      }

      if (state.blackjack.sideBets.twentyOnePlusThree) {
        basePlayer.balance += player.sidebets.twentyOnePlusThree || 0;
      }

      if (state.blackjack.sideBets.betBehind) {
        basePlayer.balance += player.sidebets.betBehind.bet || 0;
      }

      resultStrings.push(`${basePlayer.name} was refunded $${player.bet.toFixed(2)}`);

      newBasePlayers = newBasePlayers.map((p) => {
        if (p.id === basePlayer.id) {
          return basePlayer;
        }
        return p;
      });
    }

    setModalOpen(true);
    modals.open({
      title: "Refunds",
      onClose: () => {
        setModalOpen(false);
      },
      children: (
        <>
          {resultStrings.map((str) => {
            return <Text key={str}>{str}</Text>;
          })}
        </>
      ),
    });

    let newPastSeenCards = [...state.blackjack.pastGameSeenCards];
    for (let card of state.blackjack.seenCards) {
      newPastSeenCards.push(card);
    }

    setState({
      ...state,
      players: newBasePlayers,
      blackjack: {
        state: "NONE",
        turn: "",
        dealerCards: [EMPTY_CARD, EMPTY_CARD],
        firstRound: true,
        players: state.blackjack.players
          .filter((p) => p.splitFrom == null)
          .map((p) => {
            return {
              ...p,
              cards: [EMPTY_CARD, EMPTY_CARD],
              doubledDown: false,
              split: false,
              handPartialResult: undefined,
              handResult: undefined,
              sidebets: {
                twentyOnePlusThree: p.sidebets.twentyOnePlusThree,
                perfectPairs: p.sidebets.perfectPairs,
                betBehind: {
                  bet: p.sidebets.betBehind.bet,
                  target: p.sidebets.betBehind.target,
                },
              },
            };
          }),
        deckCount: state.blackjack.deckCount,
        runningCount: state.blackjack.runningCount,
        seenCards: [],
        pastGameSeenCards: newPastSeenCards,
        sideBets: {
          ...state.blackjack.sideBets,
        },
      },
    });
  };

  const startGame = () => {
    let newBasePlayers = [...state.players];
    for (let player of state.blackjack.players) {
      let basePlayer: Player = { ...getPlayer(player.id, newBasePlayers) };
      if (basePlayer != null) {
        console.log("interfacing with", basePlayer, player.bet);
        basePlayer.balance -= player.bet;
        if (state.blackjack.sideBets.perfectPairs) {
          basePlayer.balance -= player.sidebets.perfectPairs || 0;
        }

        if (state.blackjack.sideBets.twentyOnePlusThree) {
          basePlayer.balance -= player.sidebets.twentyOnePlusThree || 0;
        }

        if (state.blackjack.sideBets.betBehind) {
          basePlayer.balance -= player.sidebets.betBehind.bet || 0;
        }
      }

      newBasePlayers = newBasePlayers.map((p) => {
        if (p.id === basePlayer.id) {
          return basePlayer;
        }
        return p;
      });
    }

    modifyState({
      players: newBasePlayers,
      blackjack: {
        state: "PLAYING",
        turn: "DEALER",
        dealerCards: [EMPTY_CARD, EMPTY_CARD],
        firstRound: true,
        players: state.blackjack.players.map((p) => {
          return {
            ...p,
            cards: [EMPTY_CARD, EMPTY_CARD],
          };
        }),
      },
    });
  };

  const playerSplit = (player: BlackjackPlayer) => {
    let newPlayer: BlackjackPlayer = {
      displayName: (state.players.find((p) => p.id === player.id)?.name || "Unknown") + " (split)",
      id: crypto.randomUUID(),
      bet: player.bet,
      cards: [player.cards[1], EMPTY_CARD],
      split: true, // We dont allow splitting twice because I don't want to program that
      doubledDown: false,
      splitFrom: player.id,
      sidebets: {
        twentyOnePlusThree: 0,
        perfectPairs: 0,
        betBehind: {
          bet: 0,
          target: null,
        },
      },
    };

    // the new player goes after the current player
    let newPlayers = [...state.blackjack.players];

    // remove the other card from the original player
    newPlayers = newPlayers.map((p) => {
      if (p.id === player.id) {
        return {
          ...p,
          cards: [player.cards[0], EMPTY_CARD],
          split: true,
        };
      }
      return p;
    });

    newPlayers.splice(newPlayers.findIndex((p) => p.id === player.id) + 1, 0, newPlayer);

    let newBasePlayers = [...state.players];
    let basePlayer: Player = { ...getPlayer(player.id, newBasePlayers) };
    if (basePlayer != null) {
      basePlayer.balance -= player.bet;
    }

    newBasePlayers = newBasePlayers.map((p) => {
      if (p.id === basePlayer.id) {
        return basePlayer;
      }
      return p;
    });

    console.log("splitting", player.id, "into", player.id, "and", newPlayer.id);
    modifyState({
      players: newBasePlayers,
      blackjack: {
        players: newPlayers,
      },
    });
  };

  const nextTurn = () => {
    let players = state.blackjack.players;
    let turnIndex = players.findIndex((p) => p.id === state.blackjack.turn);

    let nextTurnIndex = turnIndex + 1;
    if (nextTurnIndex >= players.length) {
      modifyState({
        blackjack: {
          turn: "DEALER",
        },
      });
    } else {
      modifyState({
        blackjack: {
          turn: players[nextTurnIndex].id,
        },
      });
    }
  };

  useEffect(() => {
    let tempPlayers: BlackjackPlayer[] = [];
    let tempTurn = state.blackjack.turn;
    for (let i = state.blackjack.players.length - 1; i >= 0; i--) {
      let player = state.blackjack.players[i];
      let playerTotal = getCardTotal(player.cards);
      console.log(`Player ${player.id} has ${playerTotal.total} (${player.handPartialResult})`);
      if (playerTotal.total > 21 && player.handPartialResult !== "BUST") {
        console.log(`Player ${player.id} has busted`);

        for (let p of state.blackjack.players) {
          if (p.id === player.id) {
            tempPlayers.push({
              ...p,
              handPartialResult: "BUST",
            });
          }
        }

        tempTurn =
          state.blackjack.turn === player.id
            ? state.blackjack.players.indexOf(player) + 1 < state.blackjack.players.length
              ? state.blackjack.players[state.blackjack.players.indexOf(player) + 1].id
              : "DEALER"
            : state.blackjack.turn;
      }

      if (playerTotal.total <= 21 && player.handPartialResult == "BUST") {
        console.log(`Player ${player.id} has unbusted`);

        for (let p of state.blackjack.players) {
          if (p.id === player.id) {
            tempPlayers.push({
              ...p,
              handPartialResult: undefined,
            });
          }
        }
      }

      if (playerTotal.total == 21 && player.handPartialResult !== "BLACKJACK") {
        console.log(`Player ${player.id} has blackjack`);

        for (let p of state.blackjack.players) {
          if (p.id === player.id) {
            tempPlayers.push({
              ...p,
              handPartialResult: "BLACKJACK",
            });
          }
        }

        tempTurn =
          state.blackjack.turn === player.id
            ? state.blackjack.players.indexOf(player) + 1 < state.blackjack.players.length
              ? state.blackjack.players[state.blackjack.players.indexOf(player) + 1].id
              : "DEALER"
            : state.blackjack.turn;
      }

      if (playerTotal.total < 21 && player.handPartialResult == "BLACKJACK") {
        console.log(`Player ${player.id} has unblackjacked`);

        for (let p of state.blackjack.players) {
          if (p.id === player.id) {
            tempPlayers.push({
              ...p,
              handPartialResult: undefined,
            });
          }
        }
      }
    }

    // add other players
    for (let player of state.blackjack.players) {
      if (!tempPlayers.find((p) => p.id === player.id)) {
        tempPlayers.push(player);
      }
    }

    // dont set the state if nothing has changed
    let identical = true;
    for (let i = 0; i < tempPlayers.length; i++) {
      if (_.isEqual(tempPlayers[i], state.blackjack.players[i]) === false) {
        identical = false;
        break;
      }
    }

    if (tempTurn !== state.blackjack.turn) {
      identical = false;
    }

    if (!identical) {
      setState({
        ...state,
        blackjack: {
          ...state.blackjack,
          players: tempPlayers,
          turn: tempTurn,
        },
      });
    }
  }, [state.blackjack.players]);

  useEffect(() => {
    let allPlayerCards = state.blackjack.players.map((p) => p.cards);
    allPlayerCards = [...allPlayerCards, state.blackjack.dealerCards];

    let seenCards: Card[] = [];
    for (let cards of allPlayerCards) {
      for (let card of cards) {
        if (card !== EMPTY_CARD) seenCards.push(card);
      }
    }

    seenCards = seenCards.sort();

    if (seenCards.join("") !== state.blackjack.seenCards.join("")) {
      console.log("Seen cards changed", seenCards, state.blackjack.seenCards);
      let runningCount = 0;
      // Hi Lo
      for (let card of seenCards) {
        let rank = getRankInt(card);
        if (rank >= 2 && rank <= 6) {
          runningCount++;
        } else if (rank >= 10) {
          runningCount--;
        }
      }

      setState({
        ...state,
        blackjack: {
          ...state.blackjack,
          seenCards,
          runningCount,
        },
      });
    }
  }, [state.blackjack.players, state.blackjack.dealerCards]);

  useEffect(() => {
    if (state.blackjack.state == "NONE") {
      for (let player of state.blackjack.players) {
        checkForBetErrors(getPlayer(player.id, state.players));
      }
    }
  }, [state.blackjack.state]);

  let content: ReactNode = "No content";

  switch (state.blackjack.state) {
    case "NONE":
      content = (
        <>
          <Button
            fullWidth
            mt="sm"
            disabled={
              state.blackjack.players.length <= 0 ||
              betErrors.filter((p) => p !== null).length > 0 ||
              sideBetErrors.length > 0 ||
              playerTotalBetErrors.length > 0
            }
            onClick={startGame}
          >
            Start Game {state.useKeybindings && " (Enter)"}
          </Button>
          <Button
            mt="sm"
            variant="light"
            fullWidth
            leftSection={<IconArrowsShuffle />}
            disabled={
              state.blackjack.state != "NONE" ||
              (state.blackjack.seenCards.length == 0 &&
                state.blackjack.pastGameSeenCards.length == 0)
            }
            onClick={() => {
              setState({
                ...state,
                blackjack: {
                  ...state.blackjack,
                  runningCount: 0,
                  seenCards: [],
                  pastGameSeenCards: [],
                },
              });
            }}
          >
            Shuffle Deck
          </Button>
          {state.blackjack.players.length <= 0 ? (
            <Text ta="center" c="red" size="sm" mt="xs">
              You need at least one player to start a game
            </Text>
          ) : (
            betErrors.filter((p) => p !== null).length > 0 && (
              <Text ta="center" c="red" size="sm" mt="xs">
                Players have invalid bets
              </Text>
            )
          )}
          <Divider my="md" />
          <Title order={2} mb="sm">
            Players
          </Title>
          <PlayerSelector
            betErrors={betErrors}
            setBetErrors={setBetErrors}
            sideBetErrors={sideBetErrors}
            playerBetErrors={playerTotalBetErrors}
            setPlayerBetErrors={setPlayerTotalBetErrors}
            checkForSideBetErrors={checkForSideBetErrors}
          />
        </>
      );
      break;
    case "PLAYING":
      let playerListItems: { node: ReactNode; id: string }[] = [];

      // PLAYER LIST ITEMS
      {
        state.blackjack.players.map((player) => {
          let isTurn = state.blackjack.turn === player.id;
          let cardTotal = getCardTotal(player.cards);

          // console.log(`PLAYER ${player.id} SPLIT FROM ${player.splitFrom} (${player.split})`);

          let perfectPair = findPerfectPairs(player.cards);

          // We use the dealer's first card for the 21+3 side bet
          let twentyOnePlusThree = findTwentyOnePlusThree([
            player.cards[0],
            player.cards[1],
            state.blackjack.dealerCards[0],
          ]);

          playerListItems.push({
            id: player.id,
            node: (
              <PlayerListItem
                player={getPlayer(player.splitFrom || player.id, state.players)}
                editPlayer={null}
                key={player.id}
                my="xs"
                disabled={!isTurn}
                blackjackCardsFrom={player.id}
                nameOverride={player.splitFrom ? player.displayName : undefined}
                leftCardItem={
                  <>
                    <Box>
                      <Paper
                        style={{
                          width: "4.5rem",
                          height: "4.5rem",
                          backgroundColor: "transparent",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                            }}
                          >
                            {cardTotal.ace != "NONE" && (
                              <div>
                                <Text size="sm" mb={0} fw="bold" tt="capitalize">
                                  {cardTotal.ace}
                                </Text>
                              </div>
                            )}
                            {cardTotal.total == 21 && (
                              <div>
                                <Text size="sm" mb={0} fw="bold" tt="capitalize">
                                  BLACKJACK
                                </Text>
                              </div>
                            )}

                            {cardTotal.total > 21 && (
                              <div>
                                <Text size="sm" mb={0} fw="bold" tt="capitalize">
                                  BUST
                                </Text>
                              </div>
                            )}

                            <div>
                              <Text size={rem(30)} fw="bold">
                                {cardTotal.total}
                              </Text>
                            </div>
                            <div>
                              <Text size="xs" fs="italic" c="dimmed">
                                {GetRecommendedPlayerAction(
                                  player.cards.map((c) => getRankInt(c)),
                                  getRankInt(state.blackjack.dealerCards[0]),
                                  1,
                                  true,
                                  {
                                    hitSoft17: true,
                                    surrender: "none",
                                    double: "any",
                                    doubleRange: [0, 21],
                                    doubleAfterSplit: true,
                                    resplitAces: true,
                                    offerInsurance: false,
                                    numberOfDecks: 2,
                                    maxSplitHands: 1,
                                    count: {
                                      system: "HiLo",
                                      trueCount: null,
                                    },
                                    strategyComplexity: "advanced",
                                  }
                                )}
                              </Text>
                            </div>
                          </div>
                        </div>
                      </Paper>
                    </Box>
                  </>
                }
                lefterCardItem={
                  <>
                    {state.blackjack.sideBets.betBehind &&
                      player.sidebets.betBehind != null &&
                      player.sidebets.betBehind.bet != null &&
                      player.sidebets.betBehind.target != null &&
                      player.sidebets.betBehind.bet > 0 && (
                        <Box ml="xs">
                          <Paper
                            style={{
                              width: "4.5rem",
                              height: "4.5rem",
                              backgroundColor: "transparent",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "100%",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <Text size="xs" ta="center" mb={0} c="dimmed">
                                  Bet Behind
                                </Text>
                                <Text size="xs" ta="center" mb={0} mt={0} fw={500} tt="capitalize">
                                  ${player.sidebets.betBehind.bet.toFixed(2)}
                                </Text>
                                <Text size="sm" ta="center" mb={0} fw="bold">
                                  {getPlayer(player.sidebets.betBehind.target!, state.players).name}
                                </Text>
                              </div>
                            </div>
                          </Paper>
                        </Box>
                      )}
                    {state.blackjack.sideBets.perfectPairs &&
                      player.sidebets.perfectPairs != null &&
                      player.sidebets.perfectPairs > 0 && (
                        <Box ml="xs">
                          <Paper
                            style={{
                              width: "4.5rem",
                              height: "4.5rem",
                              backgroundColor: "transparent",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "100%",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <Text size="xs" ta="center" mb={0} c="dimmed" tt="capitalize">
                                  Perfect Pairs
                                </Text>
                                <Text size="xs" ta="center" mb={0} mt={0} fw={500} tt="capitalize">
                                  ${player.sidebets.perfectPairs.toFixed(2)}
                                </Text>
                                <Text size="sm" ta="center" mb={0} fw="bold" tt="capitalize">
                                  {perfectPair}
                                </Text>
                              </div>
                            </div>
                          </Paper>
                        </Box>
                      )}
                    {state.blackjack.sideBets.twentyOnePlusThree &&
                      player.sidebets.twentyOnePlusThree != null &&
                      player.sidebets.twentyOnePlusThree > 0 && (
                        <Box ml="xs">
                          <Paper
                            style={{
                              width: "4.5rem",
                              height: "4.5rem",
                              backgroundColor: "transparent",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "100%",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <Text size="xs" ta="center" mb={0} c="dimmed">
                                  21+3
                                </Text>
                                <Text size="xs" ta="center" mb={0} mt={0} fw={500} tt="capitalize">
                                  ${player.sidebets.twentyOnePlusThree.toFixed(2)}
                                </Text>
                                <Text size="sm" ta="center" mb={0} fw="bold">
                                  {twentyOnePlusThree}
                                </Text>
                              </div>
                            </div>
                          </Paper>
                        </Box>
                      )}
                  </>
                }
                onCardClick={(_, index) => {
                  setShowCardPicker(true);
                  setCardIndex(index);
                  setCardPlayer(player.id);
                }}
              >
                <Divider my="xs" />
                <Group grow>
                  <Button
                    fullWidth
                    size="sm"
                    color="blue"
                    disabled={!isTurn || player.doubledDown || player.handPartialResult == "BUST"}
                    onClick={() => {
                      modifyState({
                        blackjack: {
                          players: state.blackjack.players.map((p) => {
                            if (p.id === player.id) {
                              return {
                                ...p,
                                cards: [...p.cards, EMPTY_CARD],
                              };
                            }
                            return p;
                          }),
                        },
                      });
                    }}
                  >
                    Hit
                    {state.useKeybindings && " (0-9)"}
                  </Button>
                  <Button fullWidth size="sm" color="green" disabled={!isTurn} onClick={nextTurn}>
                    Stand
                    {state.useKeybindings && " (Enter)"}
                  </Button>
                  <Button
                    fullWidth
                    size="sm"
                    color="red"
                    disabled={
                      !isTurn ||
                      player.cards.length > 2 ||
                      player.doubledDown ||
                      getPlayer(player.splitFrom || player.id, state.players).balance < player.bet
                    }
                    onClick={() => {
                      doubleDown(player);
                    }}
                  >
                    Double {state.useKeybindings && " (*)"}
                  </Button>
                  <Button
                    fullWidth
                    size="sm"
                    color="grape"
                    disabled={
                      !isTurn ||
                      player.doubledDown ||
                      player.cards.filter((card) => card !== EMPTY_CARD).length !== 2 ||
                      getRank(player.cards[0]) !== getRank(player.cards[1]) ||
                      player.split ||
                      player.bet > getPlayer(player.id, state.players).balance
                    }
                    onClick={() => {
                      playerSplit(player);
                    }}
                  >
                    Split {state.useKeybindings && " (-)"}
                  </Button>
                  <Button
                    fullWidth
                    size="sm"
                    color="gray"
                    disabled={isTurn}
                    onClick={() => {
                      modifyState({
                        blackjack: {
                          turn: player.id,
                          firstRound: false,
                        },
                      });
                    }}
                  >
                    Force Turn
                  </Button>
                </Group>
              </PlayerListItem>
            ),
          });
        });
      }

      let dealerTotal = getCardTotal(state.blackjack.dealerCards);

      let dealerAction: "hit" | "stand" = "stand";
      // Dealer hits on soft 17, stands on hard 17
      if (dealerTotal.ace == "SOFT" && dealerTotal.total <= 17) {
        dealerAction = "hit";
      } else if (dealerTotal.total < 17) {
        dealerAction = "hit";
      }

      content = (
        <>
          <DealerItem
            disabled={state.blackjack.turn !== "DEALER"}
            setShowCardPicker={setShowCardPicker}
            setCardPlayer={setCardPlayer}
            setCardIndex={setCardIndex}
            leftCardItem={
              <>
                <Box>
                  <Paper
                    style={{
                      width: "4.5rem",
                      height: "4.5rem",
                      backgroundColor: "transparent",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        {dealerTotal.ace != "NONE" && (
                          <div>
                            <Text size="sm" mb={0} fw="bold" tt="capitalize">
                              {dealerTotal.ace}
                            </Text>
                          </div>
                        )}
                        {dealerTotal.total == 21 && (
                          <div>
                            <Text size="sm" mb={0} fw="bold" tt="capitalize">
                              BLACKJACK
                            </Text>
                          </div>
                        )}

                        {dealerTotal.total > 21 && (
                          <div>
                            <Text size="sm" mb={0} fw="bold" tt="capitalize">
                              BUST
                            </Text>
                          </div>
                        )}

                        <div>
                          <Text size={rem(30)} fw="bold">
                            {dealerTotal.total}
                          </Text>
                        </div>

                        <div>
                          <Text size="xs" fs="italic" c="dimmed">
                            {dealerAction}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </Paper>
                </Box>
              </>
            }
          >
            <Divider my="xs" />
            <Group grow>
              {state.blackjack.firstRound ? (
                <Button
                  fullWidth
                  size="sm"
                  color="blue"
                  disabled={state.blackjack.turn !== "DEALER"}
                  onClick={() => {
                    modifyState({
                      blackjack: {
                        turn: state.blackjack.players[0].id,
                        firstRound: false,
                      },
                    });
                  }}
                >
                  Next Turn {state.useKeybindings && " (0-9 or  Enter)"}
                </Button>
              ) : (
                <Button
                  fullWidth
                  size="sm"
                  color="blue"
                  disabled={state.blackjack.turn !== "DEALER"}
                  onClick={() => {
                    modifyState({
                      blackjack: {
                        dealerCards: [...state.blackjack.dealerCards, EMPTY_CARD],
                      },
                    });
                  }}
                >
                  Add Card {state.useKeybindings && " (0-9)"}
                </Button>
              )}

              <Button
                fullWidth
                size="sm"
                color="red"
                variant={state.blackjack.turn === "DEALER" ? "filled" : "light"}
                onClick={() => {
                  refundAndEndGame();
                }}
              >
                Refund & Cancel
              </Button>
              {state.blackjack.turn === "DEALER" && !state.blackjack.firstRound && (
                <Button
                  fullWidth
                  size="sm"
                  color="green"
                  disabled={state.blackjack.turn !== "DEALER"}
                  onClick={() => {
                    // Payouts
                    payoutAndEndGame();
                  }}
                >
                  Payout {state.useKeybindings && " (Enter)"}
                </Button>
              )}
              <Button
                fullWidth
                size="sm"
                color="gray"
                disabled={state.blackjack.turn === "DEALER"}
                onClick={() => {
                  modifyState({
                    blackjack: {
                      turn: "DEALER",
                    },
                  });
                }}
              >
                Force Turn
              </Button>
            </Group>
          </DealerItem>
          {playerListItems.map((item) => (
            <div key={item.id}>{item.node}</div>
          ))}
        </>
      );
      break;
  }

  return (
    <>
      <CardPicker
        opened={showCardPicker}
        setOpened={setShowCardPicker}
        handleClose={(card) => {
          if (card != null) {
            if (cardPlayer === "DEALER") {
              let newDealerCards: Card[] = [...state.blackjack.dealerCards];
              newDealerCards[cardIndex] = card;
              modifyState({
                blackjack: {
                  dealerCards: newDealerCards,
                },
              });
              setShowCardPicker(false);
              setCardPlayer("");
              setCardIndex(0);
            } else {
              let player = state.blackjack.players.find((p) => p.id === cardPlayer);
              if (player != null) {
                console.log(player.cards, cardIndex, card);
                let newCards: Card[] = [...player.cards];
                newCards[cardIndex] = card;
                modifyState({
                  blackjack: {
                    players: state.blackjack.players.map((p) => {
                      if (p.id === cardPlayer) {
                        return {
                          ...p,
                          cards: newCards,
                        };
                      }
                      return p;
                    }),
                  },
                });
                setShowCardPicker(false);
                setCardPlayer("");
                setCardIndex(0);
              }
            }
          }
        }}
      />
      {content}
    </>
  );
}

function useKeyPress(callback: (event: KeyboardEvent) => void) {
  const state = useRecoilState(STATE);

  useEffect(() => {
    window.addEventListener("keydown", callback);
    return () => {
      window.removeEventListener("keydown", callback);
    };
  }, [state]);
}
