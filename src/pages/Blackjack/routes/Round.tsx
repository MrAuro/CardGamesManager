import { HOTKEY_SELECTOR_A_ENABLED, HOTKEY_SELECTOR_B_ENABLED } from "@/App";
import {
  BLACKJACK_GAME_STATE,
  BLACKJACK_PLAYERS_STATE,
  BLACKJACK_SETTINGS,
  KEYBINDINGS_STATE,
  PLAYERS_STATE,
  SETTINGS_STATE,
} from "@/Root";
import CardSelector from "@/components/CardSelector";
import ChipBreakdown, { CHIP_BREAKDOWN_AMOUNT } from "@/components/ChipBreakdown";
import { BlackjackPlayer, EarningsResultType } from "@/types/Blackjack";
import { Card, CardRank, CardSuit } from "@/types/Card";
import { availableCards } from "@/types/Keybindings";
import { Player } from "@/types/Player";
import {
  findPerfectPairs,
  findTwentyOnePlusThree,
  getCardTotal,
  getHandResult,
} from "@/utils/BlackjackHelper";
import { EMPTY_CARD, getRankInt } from "@/utils/CardHelper";
import { formatMoney } from "@/utils/MoneyHelper";
import { getPlayer } from "@/utils/PlayerHelper";
import { useRecoilImmerState } from "@/utils/RecoilImmer";
import {
  Button,
  Divider,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { useEffect, useState } from "react";
import { createEvent } from "react-event-hook";
import { useHotkeys } from "react-hotkeys-hook";
import { atom, useRecoilState, useRecoilValue } from "recoil";
import DealerCard from "../components/DealerCard";
import RoundPlayerCard from "../components/RoundPlayerCard";

export const CARD_SELECTOR_STATE = atom<{
  opened: boolean;
  intitalCard: Card;
  onSubmitTarget: string; // ID of a player or "DEALER"
  onSubmitIndex: number; // Index of the card in the player's hand
  activeCard?: Card;
}>({
  key: "CARD_SELECTOR",
  default: {
    opened: false,
    intitalCard: "--",
    onSubmitTarget: "",
    onSubmitIndex: 0,
    activeCard: undefined,
  },
});

export const { useBjActionListener, emitBjAction } = createEvent("bjAction")<
  "stand" | "double" | "split" | number
>();

export default function Round() {
  const [blackjackSettings] = useRecoilState(BLACKJACK_SETTINGS);
  const [blackjackPlayers, setBlackjackPlayers] = useRecoilImmerState(BLACKJACK_PLAYERS_STATE);
  const [blackjackGame, setBlackjackGame] = useRecoilState(BLACKJACK_GAME_STATE);
  const [cardSelector, setCardSelector] = useRecoilState(CARD_SELECTOR_STATE);
  const [players, setPlayers] = useRecoilImmerState(PLAYERS_STATE);
  const [keybindings] = useRecoilImmerState(KEYBINDINGS_STATE);
  const [activeCardOverride, setActiveCardOverride] = useState<Card | undefined>(undefined);
  const [settings] = useRecoilState(SETTINGS_STATE);
  const [_, setChipBreakdownAmount] = useRecoilState(CHIP_BREAKDOWN_AMOUNT);
  const theme = useMantineTheme();

  useBjActionListener((action) => {
    if (action === "stand") {
      nextTurn();
      return;
    }

    if (action === "double") {
      const player = blackjackPlayers.find((p) => p.id == blackjackGame.currentTurn);
      const playerObj = players.find((p) => p.id == blackjackGame.currentTurn);
      doubleDown(player!, playerObj!);
      return;
    }

    if (action === "split") {
      splitHand(blackjackGame.currentTurn);
      return;
    }

    if (typeof action === "number") {
      setBlackjackPlayers((draft) => {
        let blackjackPlayer = draft.find((p) => p.id == blackjackGame.currentTurn);

        if (blackjackPlayer) {
          blackjackPlayer.bet = action;
        }
      });
    }
  });

  useEffect(() => {
    if (!settings.cornerOfEyeMode) return;

    // document.body.style.backgroundColor
    if (blackjackGame.currentTurn == "DEALER") {
      const calculatedCardResult = getCardTotal(blackjackGame.dealerCards);

      let dealerAction: "hit" | "stand" = "stand";
      // Dealer hits on soft 17, stands on hard 17
      if (calculatedCardResult.ace == "SOFT" && calculatedCardResult.total <= 17) {
        dealerAction = "hit";
      } else if (calculatedCardResult.total < 17) {
        dealerAction = "hit";
      }

      if (calculatedCardResult.total > 21) {
        document.body.style.backgroundColor = theme.colors.red[7];
      } else if (calculatedCardResult.total == 21) {
        document.body.style.backgroundColor = theme.colors.yellow[7];
      } else if (dealerAction == "hit") {
        document.body.style.backgroundColor = theme.colors.blue[7];
      } else {
        document.body.style.backgroundColor = theme.colors.dark[7];
      }
    } else {
      const bjPlayer = blackjackPlayers.find((p) => p.id == blackjackGame.currentTurn);
      let handTotal = getCardTotal(bjPlayer!.cards).total;
      if (handTotal > 21) {
        document.body.style.backgroundColor = theme.colors.red[7];
      } else if (handTotal == 21) {
        document.body.style.backgroundColor = theme.colors.yellow[7];
      } else {
        document.body.style.backgroundColor = theme.colors.dark[7];
      }
    }
  }, [blackjackGame.currentTurn, blackjackGame.dealerCards, blackjackPlayers]);

  const selectorA = useRecoilValue(HOTKEY_SELECTOR_A_ENABLED);
  const selectorB = useRecoilValue(HOTKEY_SELECTOR_B_ENABLED);

  keybindings.forEach((keybinding) => {
    if (keybinding.scope === "Blackjack Round") {
      useHotkeys(keybinding.key, (e) => {
        if (keybinding.selector == "A" && !selectorA) return;
        if (keybinding.selector == "B" && !selectorB) return;

        if (keybinding.selector == "None" && (selectorA || selectorB)) return;

        e.preventDefault();

        switch (keybinding.action) {
          case "Next Turn":
            if (blackjackGame.currentTurn == "DEALER" && !blackjackGame.dealerFirstTime) {
              payoutAndEnd();
            } else {
              nextTurn();
            }
            break;

          case "Refund & Cancel":
            refundAndCancel();
            break;

          case "Hit":
            {
              if (blackjackGame.currentTurn == "DEALER") {
                if (!blackjackGame.dealerCards.some((card) => card == EMPTY_CARD)) {
                  setBlackjackGame({
                    ...blackjackGame,
                    dealerCards: [...blackjackGame.dealerCards, EMPTY_CARD],
                  });
                }
              } else {
                setBlackjackPlayers((draft) => {
                  let blackjackPlayer = draft.find((p) => p.id == blackjackGame.currentTurn);

                  if (
                    blackjackPlayer &&
                    !blackjackPlayer.doubledDown &&
                    !blackjackPlayer.cards.some((card) => card == EMPTY_CARD)
                  ) {
                    blackjackPlayer.cards.push(EMPTY_CARD);
                  }
                });
              }
            }
            break;

          case "Double":
            {
              doubleDown(
                blackjackPlayers.find((p) => p.id == blackjackGame.currentTurn)!,
                players.find((p) => p.id == blackjackGame.currentTurn)!
              );
            }
            break;

          case "Split":
            {
              splitHand(blackjackGame.currentTurn);
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
                if (blackjackGame.currentTurn == "DEALER") {
                  let cards = [...blackjackGame.dealerCards];
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

                  setBlackjackGame({
                    ...blackjackGame,
                    dealerCards: cards,
                  });
                } else {
                  setBlackjackPlayers((draft) => {
                    let blackjackPlayer = draft.find((p) => p.id == blackjackGame.currentTurn);

                    if (blackjackPlayer) {
                      if (blackjackPlayer.cards.includes(EMPTY_CARD)) {
                        let lastCard =
                          blackjackPlayer.cards[blackjackPlayer.cards.indexOf(EMPTY_CARD) - 1];
                        blackjackPlayer.cards[blackjackPlayer.cards.indexOf(EMPTY_CARD) - 1] = `${
                          lastCard[0]
                        }${keybinding.action as CardSuit}` as Card;
                      } else {
                        let lastCard = blackjackPlayer.cards[blackjackPlayer.cards.length - 1];
                        blackjackPlayer.cards[blackjackPlayer.cards.length - 1] = `${lastCard[0]}${
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
                if (blackjackGame.currentTurn == "DEALER") {
                  let newDealerCards = [...blackjackGame.dealerCards];
                  if (newDealerCards.includes(EMPTY_CARD)) {
                    newDealerCards[newDealerCards.indexOf(EMPTY_CARD)] = `${
                      keybinding.action as CardRank
                    }${"-"}` as Card;
                  } else {
                    newDealerCards.push(`${keybinding.action as CardRank}${"-"}` as Card);
                  }
                  setBlackjackGame({
                    ...blackjackGame,
                    dealerCards: newDealerCards,
                  });
                } else {
                  setBlackjackPlayers((draft) => {
                    let blackjackPlayer = draft.find((p) => p.id == blackjackGame.currentTurn);

                    if (blackjackPlayer) {
                      if (blackjackPlayer.cards.includes(EMPTY_CARD)) {
                        blackjackPlayer.cards[blackjackPlayer.cards.indexOf(EMPTY_CARD)] = `${
                          keybinding.action as CardRank
                        }${"-"}` as Card;
                      } else {
                        blackjackPlayer.cards.push(
                          `${keybinding.action as CardRank}${"-"}` as Card
                        );
                      }
                    }
                  });
                }
              }
            }
            break;

          case "Remove Last Card":
            {
              if (blackjackGame.currentTurn == "DEALER") {
                let cards = [...blackjackGame.dealerCards];
                if (blackjackGame.dealerCards.length <= 2) {
                  if (cards[1] == EMPTY_CARD) {
                    cards[0] = EMPTY_CARD;
                  } else {
                    cards[1] = EMPTY_CARD;
                  }
                } else {
                  cards.pop();
                }

                setBlackjackGame({
                  ...blackjackGame,
                  dealerCards: cards,
                });
              } else {
                setBlackjackPlayers((draft) => {
                  let blackjackPlayer = draft.find((p) => p.id == blackjackGame.currentTurn);

                  let cards = blackjackPlayer!.cards;
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
                    if (blackjackGame.currentTurn == "DEALER") {
                      let cards = [...blackjackGame.dealerCards];
                      if (cards.includes(EMPTY_CARD)) {
                        cards[cards.indexOf(EMPTY_CARD)] = card;
                      } else {
                        cards.push(card);
                      }

                      setBlackjackGame({
                        ...blackjackGame,
                        dealerCards: cards,
                      });
                    } else {
                      setBlackjackPlayers((draft) => {
                        let blackjackPlayer = draft.find((p) => p.id == blackjackGame.currentTurn);

                        if (blackjackPlayer) {
                          if (blackjackPlayer.cards.includes(EMPTY_CARD)) {
                            blackjackPlayer.cards[blackjackPlayer.cards.indexOf(EMPTY_CARD)] =
                              card as Card;
                          } else {
                            blackjackPlayer.cards.push(card as Card);
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

  const nextTurn = (dealerFirstTurn: boolean = false) => {
    console.log(`NEXT TURN`);

    if (blackjackGame.currentTurn == "DEALER") {
      console.log(
        `Dealers first turn. Setting to ${blackjackPlayers[0].id} (${blackjackPlayers[0].displayName})`
      );

      setBlackjackGame({
        ...blackjackGame,
        currentTurn: blackjackPlayers[0].id,
        dealerFirstTime: dealerFirstTurn,
      });
    } else {
      console.log(`Current turn is ${blackjackGame.currentTurn}`);
      let turnIndex = blackjackPlayers.findIndex((p) => p.id === blackjackGame.currentTurn);
      console.log(`Index of current turn is ${turnIndex}`);

      let nextTurnIndex = turnIndex + 1;
      console.log(`Next turn index is ${nextTurnIndex}`);
      if (nextTurnIndex >= blackjackPlayers.length) {
        console.log(
          `Next turn index is greater than or equal to the length of the players array. Setting to DEALER`
        );
        setBlackjackGame({
          ...blackjackGame,
          currentTurn: "DEALER",
        });
      } else {
        console.log(
          `Setting to ${blackjackPlayers[nextTurnIndex].id} (${blackjackPlayers[nextTurnIndex].displayName})`
        );
        setBlackjackGame({
          ...blackjackGame,
          currentTurn: blackjackPlayers[nextTurnIndex].id,
        });
      }
    }
  };

  const splitHand = (playerId: string) => {
    console.log(`Splitting hand for ${playerId}`);

    const player = players.find((p) => p.id === playerId);
    const blackjackPlayer = blackjackPlayers.find((p) => p.id === playerId);

    if (!player || !blackjackPlayer) {
      console.error("Player not found when splitting", playerId);
      return;
    }

    if (player.balance < blackjackPlayer.bet) {
      console.error("Player does not have enough balance to split", playerId);
      return;
    }

    if (blackjackPlayer.cards.length > 2) {
      console.error("Player has more than 2 cards", playerId);
      return;
    }

    if (getRankInt(blackjackPlayer.cards[0]) != getRankInt(blackjackPlayer.cards[1])) {
      console.error("Cards are not the same rank", playerId);
      return;
    }

    if (blackjackPlayer.split || blackjackPlayer.splitFrom) {
      console.error("Player has already split", playerId);
      return;
    }

    setPlayers((draft) => {
      draft.forEach((player) => {
        if (player.id === playerId) {
          player.balance -= blackjackPlayer.bet;
        }
      });
    });

    let newBlackjackPlayers: BlackjackPlayer[] = [...blackjackPlayers];
    const playerIndex = newBlackjackPlayers.findIndex((p) => p.id === playerId);

    // add a new player after the current player
    newBlackjackPlayers.splice(playerIndex + 1, 0, {
      ...blackjackPlayer,
      id: `${blackjackPlayer.id}-SPLIT`,
      displayName: `${blackjackPlayer.displayName} (Split)`,
      cards: [blackjackPlayer.cards[1], EMPTY_CARD],
      split: true,
      splitFrom: playerId,
      sidebets: {
        betBehind: {
          bet: 0,
          target: null,
        },
        perfectPairs: 0,
        twentyOnePlusThree: 0,
      },
    });

    // remove the second card from the current player
    newBlackjackPlayers[playerIndex] = {
      ...blackjackPlayer,
      cards: [blackjackPlayer.cards[0], EMPTY_CARD],
      split: true,
    };

    setBlackjackPlayers(newBlackjackPlayers);
  };

  const doubleDown = (blackjackPlayer: BlackjackPlayer, _: Player) => {
    setBlackjackPlayers((draft) => {
      draft.map((bjPlayer) => {
        if (bjPlayer.id == blackjackPlayer.id) {
          bjPlayer.doubledDown = true;
          bjPlayer.cards.push(EMPTY_CARD);
        }
      });
    });

    setPlayers((draft) => {
      draft.map((player) => {
        let id = blackjackPlayer.splitFrom || blackjackPlayer.id;
        if (player.id == id) {
          player.balance -= blackjackPlayer.bet;
        }
      });
    });
  };

  const forceTurn = (playerId: string) => {
    setBlackjackGame({
      ...blackjackGame,
      currentTurn: playerId,
    });
  };

  const refundAndCancel = () => {
    let newPlayers: Player[] = [...players];
    let newBlackjackPlayers: BlackjackPlayer[] = [...blackjackPlayers];
    console.log(newPlayers, newBlackjackPlayers, "new");

    for (let blackjackPlayer of newBlackjackPlayers) {
      let amountToRefund = blackjackPlayer.bet;
      if (blackjackPlayer.doubledDown) {
        amountToRefund += blackjackPlayer.bet;
      }

      if (blackjackPlayer.sidebets.betBehind) {
        amountToRefund += blackjackPlayer.sidebets.betBehind.bet;
      }

      if (blackjackPlayer.sidebets.perfectPairs) {
        amountToRefund += blackjackPlayer.sidebets.perfectPairs;
      }

      if (blackjackPlayer.sidebets.twentyOnePlusThree) {
        amountToRefund += blackjackPlayer.sidebets.twentyOnePlusThree;
      }

      newPlayers = newPlayers.map((p) => {
        if (p.id === blackjackPlayer.id) {
          return {
            ...p,
            balance: p.balance + amountToRefund,
          };
        }
        return p;
      });

      newBlackjackPlayers = newBlackjackPlayers.map((p) => {
        if (p.id === blackjackPlayer.id) {
          return {
            ...p,
            cards: [EMPTY_CARD, EMPTY_CARD],
            doubledDown: false,
          };
        }
        return p;
      });
    }

    newBlackjackPlayers = newBlackjackPlayers.filter((p) => !p.splitFrom);

    document.body.style.backgroundColor = theme.colors.dark[7];

    setBlackjackGame({
      ...blackjackGame,
      currentTurn: "DEALER",
      dealerCards: [EMPTY_CARD, EMPTY_CARD],
      dealerFirstTime: true,
      gameState: "PREROUND",
    });

    setBlackjackPlayers(newBlackjackPlayers);
    setPlayers(newPlayers);
  };

  const payoutAndEnd = () => {
    const dealerTotal = getCardTotal(blackjackGame.dealerCards);
    let newPlayers: Player[] = [...players];
    let newBlackjackPlayers: BlackjackPlayer[] = [...blackjackPlayers];

    let earningsResults: EarningsResultType[] = [];
    for (let blackjackPlayer of newBlackjackPlayers) {
      let handResult = getHandResult(getCardTotal(blackjackPlayer.cards).total, dealerTotal.total);
      let bet = blackjackPlayer.doubledDown ? blackjackPlayer.bet * 2 : blackjackPlayer.bet;
      console.log(
        `Bet: ${bet} because doubled down: ${blackjackPlayer.doubledDown} | Payout: ${handResult}`
      );

      let payout = 0;
      if (handResult == "BLACKJACK") {
        payout += bet * blackjackSettings.blackjackPayout + bet;
      } else if (handResult == "WIN") {
        payout += bet * 2;
      } else if (handResult == "PUSH") {
        payout += bet;
      }

      if (handResult != "LOSE") {
        earningsResults.push({
          source: "Blackjack",
          result: handResult,
          amount: payout,
          blackjackPlayerId: blackjackPlayer.id,
        });
      } else {
        earningsResults.push({
          source: "Blackjack",
          result: "LOSE",
          amount: -bet,
          blackjackPlayerId: blackjackPlayer.id,
        });
      }

      console.log(`Payout for ${blackjackPlayer.displayName}: ${payout}`);

      if (
        blackjackPlayer.sidebets.perfectPairs &&
        blackjackSettings.perfectPairsEnabled &&
        !blackjackPlayer.splitFrom
      ) {
        let cards = blackjackPlayer.cards;
        if (blackjackPlayer.split) {
          console.log(`PP: Player split, using both cards for perfect pairs`);
          const splitFromPlayer = blackjackPlayers.find((p) => p.splitFrom === blackjackPlayer.id);

          if (!splitFromPlayer) {
            console.error("PP: Split from player not found", blackjackPlayer);
            return;
          }

          cards = [blackjackPlayer.cards[0], splitFromPlayer!.cards[0]];
        }

        const perfectPairsResult = findPerfectPairs(cards);
        let sidebetPayouts = 0;
        switch (perfectPairsResult) {
          case "None":
            {
              let amt = blackjackPlayer.sidebets.perfectPairs;
              earningsResults.push({
                source: "Perfect Pairs",
                result: "None",
                amount: -amt,
                blackjackPlayerId: blackjackPlayer.id,
              });
            }
            break;

          case "Mixed":
            {
              let amt =
                blackjackPlayer.sidebets.perfectPairs * blackjackSettings.perfectPairsMixedPayout;
              earningsResults.push({
                source: "Perfect Pairs",
                result: "Mixed",
                amount: amt,
                blackjackPlayerId: blackjackPlayer.id,
              });
              sidebetPayouts += amt;
            }
            break;

          case "Colored":
            {
              let amt =
                blackjackPlayer.sidebets.perfectPairs * blackjackSettings.perfectPairsColoredPayout;
              earningsResults.push({
                source: "Perfect Pairs",
                result: "Colored",
                amount: amt,
                blackjackPlayerId: blackjackPlayer.id,
              });
              sidebetPayouts += amt;
            }
            break;

          case "Perfect":
            {
              let amt =
                blackjackPlayer.sidebets.perfectPairs * blackjackSettings.perfectPairsSuitedPayout;
              earningsResults.push({
                source: "Perfect Pairs",
                result: "Perfect",
                amount: amt,
                blackjackPlayerId: blackjackPlayer.id,
              });
              sidebetPayouts += amt;
            }
            break;
        }

        payout += sidebetPayouts;
      }

      if (
        blackjackPlayer.sidebets.twentyOnePlusThree &&
        blackjackSettings.twentyOnePlusThreeEnabled &&
        !blackjackPlayer.splitFrom
      ) {
        let cards = [
          blackjackPlayer.cards[0],
          blackjackPlayer.cards[1],
          blackjackGame.dealerCards[0],
        ];
        if (blackjackPlayer.split) {
          console.log(`21+3: Player split, using both cards for 21+3`);
          const splitFromPlayer = blackjackPlayers.find((p) => p.splitFrom === blackjackPlayer.id);

          if (!splitFromPlayer) {
            console.error("21+3: Split from player not found", blackjackPlayer);
            return;
          }

          cards = [
            blackjackPlayer.cards[0],
            splitFromPlayer!.cards[0],
            blackjackGame.dealerCards[0],
          ];
        }

        const twentyOnePlusThreeResult = findTwentyOnePlusThree(cards);

        switch (twentyOnePlusThreeResult) {
          case "None":
            {
              let amt = blackjackPlayer.sidebets.twentyOnePlusThree;
              earningsResults.push({
                source: "21+3",
                result: "None",
                amount: -amt,
                blackjackPlayerId: blackjackPlayer.id,
              });
            }
            break;

          case "Flush":
            {
              let amt =
                blackjackPlayer.sidebets.twentyOnePlusThree *
                blackjackSettings.twentyOnePlusThreeFlushPayout;
              earningsResults.push({
                source: "21+3",
                result: "Flush",
                amount: amt,
                blackjackPlayerId: blackjackPlayer.id,
              });
              payout += amt;
            }
            break;

          case "Straight":
            {
              let amt =
                blackjackPlayer.sidebets.twentyOnePlusThree *
                blackjackSettings.twentyOnePlusThreeStraightPayout;
              earningsResults.push({
                source: "21+3",
                result: "Straight",
                amount: amt,
                blackjackPlayerId: blackjackPlayer.id,
              });
              payout += amt;
            }
            break;

          case "Three of a Kind":
            {
              let amt =
                blackjackPlayer.sidebets.twentyOnePlusThree *
                blackjackSettings.twentyOnePlusThreeThreeOfAKindPayout;
              earningsResults.push({
                source: "21+3",
                result: "Three of a Kind",
                amount: amt,
                blackjackPlayerId: blackjackPlayer.id,
              });
              payout += amt;
            }
            break;

          case "Straight Flush":
            {
              let amt =
                blackjackPlayer.sidebets.twentyOnePlusThree *
                blackjackSettings.twentyOnePlusThreeStraightFlushPayout;
              earningsResults.push({
                source: "21+3",
                result: "Straight Flush",
                amount: amt,
                blackjackPlayerId: blackjackPlayer.id,
              });
              payout += amt;
            }
            break;

          case "Suited Three of a Kind":
            {
              let amt =
                blackjackPlayer.sidebets.twentyOnePlusThree *
                blackjackSettings.twentyOnePlusThreeThreeOfAKindSuitedPayout;
              earningsResults.push({
                source: "21+3",
                result: "Suited Three of a Kind",
                amount: amt,
                blackjackPlayerId: blackjackPlayer.id,
              });
              payout += amt;
            }
            break;
        }

        payout += blackjackPlayer.sidebets.twentyOnePlusThree;
      }

      if (
        blackjackPlayer.sidebets.betBehind &&
        blackjackSettings.betBehindEnabled &&
        blackjackPlayer.sidebets.betBehind.target &&
        !blackjackPlayer.splitFrom
      ) {
        let betBehindTargetPlayer = blackjackPlayers.find(
          (p) => p.id === blackjackPlayer.sidebets.betBehind.target
        );

        if (betBehindTargetPlayer) {
          let betBehindPayout = 0;
          let betBehindHandResult = getHandResult(
            getCardTotal(betBehindTargetPlayer.cards).total,
            dealerTotal.total
          );

          if (betBehindHandResult == "BLACKJACK") {
            betBehindPayout +=
              blackjackPlayer.sidebets.betBehind.bet * blackjackSettings.blackjackPayout +
              blackjackPlayer.sidebets.betBehind.bet;
          } else if (betBehindHandResult == "WIN") {
            betBehindPayout += blackjackPlayer.sidebets.betBehind.bet * 2;
          } else if (betBehindHandResult == "PUSH") {
            betBehindPayout += blackjackPlayer.sidebets.betBehind.bet;
          }

          if (betBehindHandResult != "LOSE") {
            earningsResults.push({
              source: "Bet Behind",
              result: betBehindHandResult,
              amount: betBehindPayout,
              blackjackPlayerId: blackjackPlayer.id,
            });
          } else {
            earningsResults.push({
              source: "Bet Behind",
              result: "LOSE",
              amount: -blackjackPlayer.sidebets.betBehind.bet,
              blackjackPlayerId: blackjackPlayer.id,
            });
          }

          payout += betBehindPayout;
        }
      }

      newPlayers = newPlayers.map((p) => {
        if (blackjackPlayer.splitFrom) {
          if (p.id === blackjackPlayer.splitFrom) {
            return {
              ...p,
              balance: p.balance + payout,
            };
          }
        } else {
          if (p.id === blackjackPlayer.id) {
            return {
              ...p,
              balance: p.balance + payout,
            };
          }
        }
        return p;
      });
    }

    document.body.style.backgroundColor = theme.colors.dark[7];

    let groupedResults: { [key: string]: EarningsResultType[] } = {};
    earningsResults.forEach((result) => {
      const id = result.blackjackPlayerId.includes("-SPLIT")
        ? result.blackjackPlayerId.split("-SPLIT")[0]
        : result.blackjackPlayerId;

      if (!groupedResults[id]) {
        groupedResults[id] = [];
      }

      if (result.source === "Blackjack") {
        groupedResults[id].push({
          ...result,
          split: result.blackjackPlayerId.includes("-SPLIT"),
        });
      } else {
        groupedResults[id].push(result);
      }
    });

    modals.open({
      title: "Round Results",
      onKeyDown: (event) => {
        if (event.key === "Enter") {
          modals.closeAll();
        }

        // Prevent keybindings from being triggered
        event.stopPropagation();
      },
      children: (
        <>
          <ScrollArea>
            {Object.entries(groupedResults).map(([key, value]) => {
              const player = getPlayer(key, players)!;
              let total = value.reduce((acc, curr) => acc + curr.amount, 0);

              return (
                <div key={key}>
                  <Title order={3}>{player.name}</Title>
                  <Table
                    withColumnBorders
                    withRowBorders
                    verticalSpacing={4}
                    style={{
                      tableLayout: "fixed",
                      width: "100%",
                    }}
                  >
                    <Table.Tbody>
                      {value.map((result, index) => {
                        if (result.source == "Blackjack") {
                          return (
                            <Table.Tr key={index}>
                              <Table.Td>
                                Base{" "}
                                {result.result.toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                                {result.split ? " (Split)" : ""}
                              </Table.Td>
                              <Table.Td>
                                <Text size="sm" c={result.amount > 0 ? "green" : "red"}>
                                  {result.amount > 0 ? "+" : null}
                                  {formatMoney(result.amount)}
                                </Text>
                              </Table.Td>
                            </Table.Tr>
                          );
                        } else {
                          return (
                            <Table.Tr key={index}>
                              <Table.Td>{result.source}</Table.Td>
                              <Table.Td>
                                <Text size="sm" c={result.amount > 0 ? "green" : "red"}>
                                  {result.amount > 0 ? "+" : null}
                                  {formatMoney(result.amount)}
                                </Text>
                              </Table.Td>
                            </Table.Tr>
                          );
                        }
                      })}
                      <Table.Tr>
                        <Table.Td fw="bold">Total</Table.Td>
                        <Table.Td>
                          <Text size="md" fw="bold" c={total > 0 ? "green" : "red"}>
                            {formatMoney(total)}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    </Table.Tbody>
                  </Table>
                  {settings.touchscreenMenu && (
                    <Button
                      fullWidth
                      variant="light"
                      mt="sm"
                      onClick={() => {
                        setChipBreakdownAmount(total);
                      }}
                    >
                      Chip Breakdown
                    </Button>
                  )}
                  <Divider mt="sm" />
                </div>
              );
            })}
            {settings.touchscreenMenu && (
              <Paper withBorder p="sm" mt="sm">
                <ChipBreakdown />
              </Paper>
            )}
          </ScrollArea>
        </>
      ),
    });

    setBlackjackGame({
      ...blackjackGame,
      currentTurn: "DEALER",
      dealerCards: [EMPTY_CARD, EMPTY_CARD],
      dealerFirstTime: true,
      gameState: "PREROUND",
    });

    setBlackjackPlayers(newBlackjackPlayers.filter((p) => !p.splitFrom));
    setPlayers(newPlayers);
  };

  return (
    <>
      <CardSelector
        opened={cardSelector.opened}
        intitialCard={cardSelector.intitalCard}
        activeCardOverride={activeCardOverride}
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
          refundAndCancel={refundAndCancel}
          payoutAndEnd={payoutAndEnd}
        />
        {blackjackPlayers.map((blackjackPlayer) => {
          return (
            <RoundPlayerCard
              key={blackjackPlayer.id}
              player={getPlayer(blackjackPlayer.splitFrom || blackjackPlayer.id, players)!}
              blackjackPlayer={blackjackPlayer}
              isActive={blackjackGame.currentTurn == blackjackPlayer.id}
              nextTurn={nextTurn}
              forceTurn={forceTurn}
              splitHand={splitHand}
              doubleDown={doubleDown}
            />
          );
        })}
      </Stack>
    </>
  );
}
