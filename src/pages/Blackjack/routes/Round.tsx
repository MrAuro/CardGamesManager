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
import { getCardTotal } from "@/utils/BlackjackHelper";
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
            console.log(blackjackGame);
            if (blackjackGame.currentTurn == "DEALER" && !blackjackGame.dealerFirstTime) {
              payoutAndEnd();
            } else {
              nextTurn();
            }
            break;

          case "Payout & End":
            // TODO: Implement payout and end
            console.log("Payout & End");
            break;

          case "Refund & Cancel":
            // TODO: Implement refund and cancel
            console.log("Refund & Cancel");
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
      const handTotal = getCardTotal(blackjackPlayer.cards);
      const player = getPlayer(blackjackPlayer.id, players)!;

      let result: "BLACKJACK" | "WIN" | "LOSE" | "PUSH" = "LOSE";

      if (handTotal.total > 21) {
        result = "LOSE";
      } else if (dealerTotal.total == handTotal.total) {
        result = "PUSH";
      } else if (handTotal.total == 21) {
        result = "BLACKJACK";
      } else if (dealerTotal.total > 21) {
        result = "WIN";
      } else if (dealerTotal.total > handTotal.total) {
        result = "LOSE";
      } else if (dealerTotal.total < handTotal.total) {
        result = "WIN";
      }

      let bet = blackjackPlayer.doubledDown ? blackjackPlayer.bet * 2 : blackjackPlayer.bet;
      let payout = 0;

      if (result == "BLACKJACK") {
        payout = bet * 1.5;
        payout += bet;
      } else if (result == "WIN") {
        payout = bet;
        payout += bet;
      } else if (result == "PUSH") {
        payout = bet;
      }

      // TODO: Add sidebet payouts

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
