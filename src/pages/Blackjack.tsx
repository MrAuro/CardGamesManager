import {
  Box,
  Button,
  Divider,
  Group,
  Paper,
  Text,
  Title,
  darken,
  rem,
  useMantineTheme,
} from "@mantine/core";
import React, { ReactNode, useEffect, useState } from "react";
import { STATE, State } from "../App";
import PlayerListItem from "../components/PlayerListItem";
import PlayerSelector from "../components/PlayingList";
import { BlackjackPlayer, getCardTotal, getPlayer } from "../utils/BlackjackHelper";
import { useCustomRecoilState } from "../utils/RecoilHelper";
import DealerItem from "../components/DealerItem";
import { Card, CardSuit, EMPTY_CARD, getRank } from "../utils/CardHelper";
import CardPicker from "../components/CardPicker";
import { CardRank } from "../utils/PokerHelper";
import { useRecoilState } from "recoil";
import { IconBolt, IconMobiledataOff } from "@tabler/icons-react";
import { Player } from "../types/Player";

export default function Blackjack() {
  const [state, setState, modifyState] = useCustomRecoilState<State>(STATE);
  const [betErrors, setBetErrors] = useState<(string | null)[]>([]);

  const theme = useMantineTheme();

  useKeyPress((event) => {
    if (!state.useKeybindings) return;

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
        val = "9";
        break;

      case "0":
        val = "T";
        break;

      case "Enter":
        {
          // Stands
          nextTurn();
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
          }
        }
        break;
    }

    if (val != null) {
      let randomSuit = (["h", "s", "d", "c"] as CardSuit[])[Math.floor(Math.random() * 4)];
      let rank: CardRank = val as CardRank;
      let card: Card = `${rank}${randomSuit}` as Card;

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
      }
    }
  });

  const [showCardPicker, setShowCardPicker] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [cardPlayer, setCardPlayer] = useState("");

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
    for (let player of state.blackjack.players) {
      let playerTotal = getCardTotal(player.cards);
      console.log(`Player ${player.id} has ${playerTotal.total} (${player.handPartialResult})`);
      if (playerTotal.total > 21 && player.handPartialResult !== "BUST") {
        console.log(`Player ${player.id} has busted`);
        let players: BlackjackPlayer[] = state.blackjack.players.map((p) => {
          if (p.id === player.id) {
            return {
              ...p,
              handPartialResult: "BUST",
            };
          }
          return p;
        });

        setState({
          ...state,
          blackjack: {
            ...state.blackjack,
            players,
            turn:
              state.blackjack.turn === player.id
                ? state.blackjack.players.indexOf(player) + 1 < state.blackjack.players.length
                  ? state.blackjack.players[state.blackjack.players.indexOf(player) + 1].id
                  : "DEALER"
                : state.blackjack.turn,
          },
        });
      }

      if (playerTotal.total <= 21 && player.handPartialResult == "BUST") {
        console.log(`Player ${player.id} has unbusted`);
        let players: BlackjackPlayer[] = state.blackjack.players.map((p) => {
          if (p.id === player.id) {
            return {
              ...p,
              handPartialResult: undefined,
            };
          }
          return p;
        });

        setState({
          ...state,
          blackjack: {
            ...state.blackjack,
            players,
          },
        });
      }
    }
  }, [state.blackjack.players]);

  let content: ReactNode = "No content";

  switch (state.blackjack.state) {
    case "NONE":
      content = (
        <>
          <Button
            fullWidth
            mt="sm"
            disabled={
              state.blackjack.players.length <= 0 || betErrors.filter((p) => p !== null).length > 0
            }
            onClick={() => {
              let newBasePlayers = [...state.players];
              for (let player of state.blackjack.players) {
                let basePlayer: Player = { ...getPlayer(player.id, newBasePlayers) };
                if (basePlayer != null) {
                  console.log("interfacing with", basePlayer, player.bet);
                  basePlayer.balance -= player.bet;
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
                  turn: state.blackjack.players[0].id,
                  dealerCards: [EMPTY_CARD, EMPTY_CARD],
                  players: state.blackjack.players.map((p) => {
                    return {
                      ...p,
                      cards: [EMPTY_CARD, EMPTY_CARD],
                    };
                  }),
                },
              });
            }}
          >
            Start Game
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
          <PlayerSelector betErrors={betErrors} setBetErrors={setBetErrors} />
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
                            {player.handPartialResult && (
                              <div>
                                <Text size="sm" mb={0} fw="bold" tt="capitalize">
                                  {player.handPartialResult}
                                </Text>
                              </div>
                            )}

                            <div>
                              <Text size={rem(30)} fw="bold">
                                {cardTotal.total}
                              </Text>
                            </div>
                          </div>
                        </div>
                      </Paper>
                    </Box>
                  </>
                }
                onCardClick={(card, index) => {
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
                    disabled={!isTurn || player.doubledDown}
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
                  </Button>
                  <Button fullWidth size="sm" color="green" disabled={!isTurn} onClick={nextTurn}>
                    Stand
                  </Button>
                  <Button
                    fullWidth
                    size="sm"
                    color="red"
                    disabled={!isTurn || player.cards.length > 2}
                    onClick={() => {
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
                    }}
                  >
                    Double
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
                      let newPlayer: BlackjackPlayer = {
                        displayName:
                          (state.players.find((p) => p.id === player.id)?.name || "Unknown") +
                          " (split)",
                        id: crypto.randomUUID(),
                        bet: player.bet,
                        cards: [player.cards[1], EMPTY_CARD],
                        split: true, // We dont allow splitting twice because I don't want to program that
                        doubledDown: false,
                        splitFrom: player.id,
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

                      newPlayers.splice(
                        newPlayers.findIndex((p) => p.id === player.id) + 1,
                        0,
                        newPlayer
                      );

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

                      modifyState({
                        players: newBasePlayers,
                        blackjack: {
                          players: newPlayers,
                        },
                      });
                    }}
                  >
                    Split
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

      content = (
        <>
          <DealerItem disabled={state.blackjack.turn !== "DEALER"} />
          {playerListItems.map((item) => (
            <div key={item.id}>{item.node}</div>
          ))}
        </>
      );
      break;
  }

  return (
    <>
      {state.blackjack.turn}
      <CardPicker
        opened={showCardPicker}
        setOpened={setShowCardPicker}
        hideSuit
        handleClose={(card) => {
          if (card != null) {
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
