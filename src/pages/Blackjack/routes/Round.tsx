import {
  BLACKJACK_GAME_STATE,
  BLACKJACK_PLAYERS_STATE,
  BLACKJACK_SETTINGS,
  KEYBINDINGS_STATE,
  PLAYERS_STATE,
} from "@/Root";
import CardSelector from "@/components/CardSelector";
import { BlackjackPlayer } from "@/types/Blackjack";
import { Card, CardRank, CardSuit } from "@/types/Card";
import { availableCards } from "@/types/Keybindings";
import { Player } from "@/types/Player";
import {
  calculateBasePayoutMultiplier,
  findPerfectPairs,
  findTwentyOnePlusThree,
  getCardTotal,
} from "@/utils/BlackjackHelper";
import { EMPTY_CARD } from "@/utils/CardHelper";
import { getPlayer } from "@/utils/PlayerHelper";
import { useRecoilImmerState } from "@/utils/RecoilImmer";
import { Stack, useMantineTheme } from "@mantine/core";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { atom, useRecoilState } from "recoil";
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

export default function Round() {
  const theme = useMantineTheme();
  const [blackjackSettings] = useRecoilState(BLACKJACK_SETTINGS);
  const [blackjackPlayers, setBlackjackPlayers] = useRecoilImmerState(BLACKJACK_PLAYERS_STATE);
  const [blackjackGame, setBlackjackGame] = useRecoilState(BLACKJACK_GAME_STATE);
  const [cardSelector, setCardSelector] = useRecoilState(CARD_SELECTOR_STATE);
  const [players, setPlayers] = useRecoilImmerState(PLAYERS_STATE);
  const [keybindings] = useRecoilImmerState(KEYBINDINGS_STATE);
  const [activeCardOverride, setActiveCardOverride] = useState<Card | undefined>(undefined);

  keybindings.forEach((keybinding) => {
    if (keybinding.scope === "Blackjack Round") {
      useHotkeys(keybinding.key, (e) => {
        e.preventDefault();

        switch (keybinding.action) {
          case "Next Turn":
          case "Stand":
          case "Payout & End":
            console.log(blackjackGame);
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
              setBlackjackPlayers((draft) => {
                let blackjackPlayer = draft.find((p) => p.id == blackjackGame.currentTurn);

                if (
                  blackjackPlayer &&
                  !blackjackPlayer.doubledDown &&
                  getPlayer(blackjackPlayer.id, players)!.balance >= blackjackPlayer.bet
                ) {
                  blackjackPlayer.doubledDown = true;
                  blackjackPlayer.cards.push(EMPTY_CARD);
                }
              });

              setPlayers((draft) => {
                let player = draft.find((p) => p.id == blackjackGame.currentTurn);
                if (player) {
                  let blackjackPlayer = blackjackPlayers.find((p) => p.id == player!.id);
                  player.balance -= blackjackPlayer!.bet;
                }
              });
            }
            break;

          case "Split":
            // TODO: Implement split
            console.log("Split");
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

    for (let blackjackPlayer of newBlackjackPlayers) {
      let earningsStrings = [];

      let payoutMultiplier = calculateBasePayoutMultiplier(
        getCardTotal(blackjackPlayer.cards).total,
        dealerTotal.total
      );
      let bet = blackjackPlayer.doubledDown ? blackjackPlayer.bet * 2 : blackjackPlayer.bet;

      let payout = 0;
      payout += bet * payoutMultiplier;

      if (payoutMultiplier == 2.5) {
        earningsStrings.push("Blackjack");
      } else if (payoutMultiplier == 2) {
        earningsStrings.push("Win");
      } else if (payoutMultiplier == 1) {
        earningsStrings.push("Push");
      }

      if (blackjackPlayer.sidebets.perfectPairs && blackjackSettings.perfectPairsEnabled) {
        const perfectPairsResult = findPerfectPairs(blackjackPlayer.cards);
        let sidebetPayouts = 0;
        switch (perfectPairsResult) {
          case "None":
            break;

          case "Mixed":
            earningsStrings.push("Perfect Pairs (Mixed)");
            sidebetPayouts +=
              blackjackPlayer.sidebets.perfectPairs * blackjackSettings.perfectPairsMixedPayout;
            break;

          case "Colored":
            earningsStrings.push("Perfect Pairs (Colored)");
            sidebetPayouts +=
              blackjackPlayer.sidebets.perfectPairs * blackjackSettings.perfectPairsColoredPayout;
            break;

          case "Perfect":
            earningsStrings.push("Perfect Pairs (Perfect)");
            sidebetPayouts +=
              blackjackPlayer.sidebets.perfectPairs * blackjackSettings.perfectPairsSuitedPayout;
            break;
        }

        payout += sidebetPayouts;
      }

      if (
        blackjackPlayer.sidebets.twentyOnePlusThree &&
        blackjackSettings.twentyOnePlusThreeEnabled
      ) {
        const twentyOnePlusThreeResult = findTwentyOnePlusThree([
          blackjackPlayer.cards[0],
          blackjackPlayer.cards[1],
          blackjackGame.dealerCards[0],
        ]);

        switch (twentyOnePlusThreeResult) {
          case "None":
            break;

          case "Flush":
            earningsStrings.push("21+3 (Flush)");
            payout +=
              blackjackPlayer.sidebets.twentyOnePlusThree *
              blackjackSettings.twentyOnePlusThreeFlushPayout;
            break;

          case "Straight":
            earningsStrings.push("21+3 (Straight)");
            payout +=
              blackjackPlayer.sidebets.twentyOnePlusThree *
              blackjackSettings.twentyOnePlusThreeStraightPayout;
            break;

          case "Three of a Kind":
            earningsStrings.push("21+3 (Three of a Kind)");
            payout +=
              blackjackPlayer.sidebets.twentyOnePlusThree *
              blackjackSettings.twentyOnePlusThreeThreeOfAKindPayout;
            break;

          case "Straight Flush":
            earningsStrings.push("21+3 (Straight Flush)");
            payout +=
              blackjackPlayer.sidebets.twentyOnePlusThree *
              blackjackSettings.twentyOnePlusThreeStraightFlushPayout;
            break;

          case "Suited Three of a Kind":
            earningsStrings.push("21+3 (Suited Three of a Kind)");
            payout +=
              blackjackPlayer.sidebets.twentyOnePlusThree *
              blackjackSettings.twentyOnePlusThreeThreeOfAKindSuitedPayout;
            break;
        }

        payout += blackjackPlayer.sidebets.twentyOnePlusThree;
      }

      if (
        blackjackPlayer.sidebets.betBehind &&
        blackjackSettings.betBehindEnabled &&
        blackjackPlayer.sidebets.betBehind.target
      ) {
        let betBehindTargetPlayer = blackjackPlayers.find(
          (p) => p.id === blackjackPlayer.sidebets.betBehind.target
        );

        if (betBehindTargetPlayer) {
          let betBehindBetMultiplier = calculateBasePayoutMultiplier(
            getCardTotal(betBehindTargetPlayer.cards).total,
            dealerTotal.total
          );

          if (betBehindBetMultiplier == 2.5) {
            earningsStrings.push("Bet Behind (Blackjack)");
          } else if (betBehindBetMultiplier == 2) {
            earningsStrings.push("Bet Behind (Win)");
          } else if (betBehindBetMultiplier == 1) {
            earningsStrings.push("Bet Behind (Push)");
          }

          payout += blackjackPlayer.sidebets.betBehind.bet * betBehindBetMultiplier;
        }
      }

      console.log(`${blackjackPlayer.displayName}: ${earningsStrings.join(", ")}`);

      newPlayers = newPlayers.map((p) => {
        if (p.id === blackjackPlayer.id) {
          return {
            ...p,
            balance: p.balance + payout,
          };
        }
        return p;
      });
    }

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
