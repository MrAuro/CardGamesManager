import {
  Accordion,
  Button,
  Container,
  Divider,
  NumberInput,
  Paper,
  Textarea,
  Title,
} from "@mantine/core";
import "@mantine/core/styles.css";
import {
  IconCards,
  IconHome,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import { atom, useRecoilState } from "recoil";
import "./App.css";
import Header from "./components/Header";
import Game from "./pages/Blackjack";
import Home from "./pages/Players";
import Settings from "./pages/Settings";
import {
  Card,
  EMPTY_CARD,
  Player,
  PlayerPosition,
  PlayerResult,
  StoredPlayerResult,
  isCardEmpty,
  joinedStringToCards,
} from "./utils/PokerHelper";
import { useEffect, useState } from "react";
import { TexasHoldem } from "poker-variants-odds-calculator";
import { Poker } from "./pages/Poker";
import Blackjack from "./pages/Blackjack";
import { getHotkeyHandler } from "@mantine/hooks";
// import type { PlayingCard } from "@xpressit/winning-poker-hand-rank/src/types";

export enum GameState {
  PREROUND = 0,
  PREFLOP = 1,
  FLOP = 2,
  TURN = 3,
  RIVER = 4,
  SHOWDOWN = 5,
  POSTROUND = 6,
  EDITING = 7,
}

export const ROUTES = [
  {
    label: "Players",
    link: "players",
    icon: <IconUsers size="1.4rem" />,
  },
  {
    label: "Blackjack",
    link: "blackjack",
    icon: <IconCards size="1.4rem" />,
  },
  {
    label: "Poker",
    link: "poker",
    icon: <IconCards size="1.4rem" />,
  },
  {
    label: "Settings",
    link: "settings",
    icon: <IconSettings size="1.4rem" />,
  },
];

export const defaultState: State = {
  activeTab: "home",
  scale: 1,

  gameState: GameState.PREROUND,
  players: [],
  communityCards: new Array(5).fill({ suit: "NONE", rank: "NONE" }),
  currentPlayerIndex: 0,
  dealerIndex: 7,
  inRound: false,
  pots: [],
  smallBlind: 0.25,
  sbPaid: false,
  bigBlind: 0.5,
  bbPaid: false,
  ante: 0.1,
  antesPaid: [],
  forcedBetType: "BLINDS",
  usedCards: [],
};

export interface State {
  activeTab: string;
  scale: 1;

  gameState: GameState;
  players: Player[];
  communityCards: Card[];
  currentPlayerIndex: number;
  dealerIndex: number;
  inRound: boolean;
  pots: {
    amount: number;
    eligiblePlayerIds: string[];
  }[];
  smallBlind: number;
  sbPaid: boolean;
  bigBlind: number;
  bbPaid: boolean;
  ante: number;
  antesPaid: string[]; // player ids
  forcedBetType: "BLINDS" | "ANTE";
  usedCards: Card[];
}

export const STATE = atom({
  key: "state",
  default: {
    ...defaultState,
    ...JSON.parse(localStorage.getItem("state") || "{}"),
  },
});

export const USED_CARDS = atom({
  key: "usedCards",
  default: [] as Card[],
});

export const PLAYER_HANDS = atom({
  key: "playerHands",
  default: [] as StoredPlayerResult[],
});

const debouncedSetItem = debounce((key: any, value: any) => {
  console.log("Saved", { key, value: JSON.parse(value) });
  localStorage.setItem(key, value);
}, 300);

function debounce(func: any, wait: any) {
  let timeout: any;
  return function executedFunction(...args: any) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function App() {
  const [state, setState] = useRecoilState<State>(STATE);
  const [usedCards, setUsedCards] = useRecoilState<Card[]>(USED_CARDS);
  const [, setHands] = useRecoilState(PLAYER_HANDS);

  useEffect(() => {
    console.log("State changed");
    debouncedSetItem("state", JSON.stringify(state));

    setUsedCards([
      ...new Set(
        [
          ...state.communityCards,
          ...state.players.map((player) => player.cards).flat(),
        ].filter((card) => card.rank != "NONE" && card.suit != "NONE")
      ),
    ]);
  }, [state]);

  useEffect(() => {
    setHands([]);

    // prettier-ignore
    const formatCard = (card: Card) => {
        return `${card.rank.toUpperCase()}${card.suit[0].toLowerCase()}`
      };

    const filterCards = (cards: Card[]): string[] => {
      return cards
        .filter((card) => card.rank != "NONE" && card.suit != "NONE")
        .map(formatCard);
    };

    const communityCards = filterCards(state.communityCards);

    const completedHands = [];
    for (let player of state.players) {
      if (player.cards.some(isCardEmpty)) {
        continue;
      }

      console.log("Pushing" + player.cards.map(formatCard));
      completedHands.push({
        ...filterCards(player.cards),
      });
    }

    // We only calculate the hands on preflop, flop, turn and river
    // Calculating hands preflop is very expensive, so updating it
    // everytime we update the cards when inputting the flop
    // is bad and causes lag
    if (
      communityCards.length == 0 ||
      communityCards.length == 3 ||
      communityCards.length == 4 ||
      communityCards.length == 5
    ) {
      const table = new TexasHoldem(completedHands.length);
      if (communityCards.length >= 3) table.setBoard(communityCards);
      completedHands.forEach((hand) => {
        table.addPlayer([hand[0], hand[1]]);
      });

      if (completedHands.length < 2) {
        return;
      }

      const result = table.calculate();
      console.log(result.toJson(), "raw result");
      const winnersResult = result.getWinners();

      const playerResults: PlayerResult[] = [];

      let highestCard = 0;
      result.getPlayers().forEach((player) => {
        joinedStringToCards(player.getHand()).forEach((card) => {
          let value = 0;

          switch (card.rank) {
            case "A":
              value = 14;
              break;
            case "K":
              value = 13;
              break;
            case "Q":
              value = 12;
              break;
            case "J":
              value = 11;
              break;
            case "T":
              value = 10;
              break;
            default:
              value = parseInt(card.rank);
          }

          if (value > highestCard) {
            highestCard = value;
          }
        });
      });

      result.getPlayers().forEach((player, i) => {
        let handRanking: string | null = null;
        let highestRank = 0;
        for (let [rank, value] of Object.entries(
          result.toJson().players[i].ranks
        )) {
          if (value > highestRank) {
            handRanking = rank;
          }
        }

        let hasHighCard = false;
        joinedStringToCards(player.getHand()).forEach((card) => {
          let value = 0;

          switch (card.rank) {
            case "A":
              value = 14;
              break;
            case "K":
              value = 13;
              break;
            case "Q":
              value = 12;
              break;
            case "J":
              value = 11;
              break;
            case "T":
              value = 10;
              break;
            default:
              value = parseInt(card.rank);
          }

          if (value == highestCard) {
            hasHighCard = true;
          }
        });

        playerResults.push({
          handRank:
            handRanking == "HIGH_CARDS"
              ? hasHighCard
                ? "HIGH_CARDS"
                : null
              : handRanking,
          hand: player.getHand(),
          ties: player.getTies(),
          tiesPercentage: player.getTiesPercentageString(),
          win: player.getWins(),
          winPercentage: player.getWinsPercentageString(),
        });
      });

      const playerResultsToStore: StoredPlayerResult[] = [];
      for (let playerResult of playerResults) {
        const handCards: Card[] = joinedStringToCards(playerResult.hand);
        let matchingPlayerId;
        state.players.forEach((player) => {
          if (
            player.cards[0].rank == handCards[0].rank &&
            player.cards[0].suit == handCards[0].suit &&
            player.cards[1].rank == handCards[1].rank &&
            player.cards[1].suit == handCards[1].suit
          ) {
            matchingPlayerId = player.id;
          }
        });

        if (!matchingPlayerId) {
          console.error("No matching player found for hand", playerResult.hand);
          continue;
        } else {
          console.log("Matching player found", matchingPlayerId);
        }

        playerResultsToStore.push({
          id: matchingPlayerId,
          result: playerResult,
        });
      }

      console.log(winnersResult);

      setHands(playerResultsToStore);
    }
  }, [usedCards]);

  useEffect(() => {
    if (state.forcedBetType == "BLINDS") {
      if (state.sbPaid && state.bbPaid) {
        console.log("Both paid");
        setState({
          ...state,
          gameState: GameState.PREFLOP,
          sbPaid: false,
          bbPaid: false,
        });
      }
    }
  }, [state.sbPaid, state.bbPaid]);

  useEffect(() => {
    if (state.forcedBetType == "ANTE") {
      console.log("Antes paid", state.antesPaid.length, state.players.length);
      if (
        state.antesPaid.length >=
        state.players.filter((p) => p.isPlaying).length
      ) {
        setState({
          ...state,
          gameState: GameState.PREFLOP,
          antesPaid: [],
        });
      }
    }
  }, [state.antesPaid]);

  // Mantine uses fontSize for scaling
  document.documentElement.style.fontSize = `${state.scale * 100}%`;

  // let content = <Text>No content</Text>;
  // switch (val.activeTab) {
  //   case "home":
  //     content = <Home />;
  //     break;
  //   case "game":
  //     content = <Game />;
  //     break;
  //   case "settings":
  //     content = <Settings />;
  //     break;
  // }

  const [TEMP_state, setTEMP_state] = useState<string>(
    JSON.stringify(state, null, 2)
  );

  return (
    <>
      <Header />
      <Divider my="xs" />
      <Paper withBorder m="sm" p="sm">
        <Title order={3}>Debug Info</Title>
        <Divider my="xs" />
        <Accordion variant="separated" defaultValue="Apples">
          <Accordion.Item key="state" value="state">
            <Accordion.Control>State</Accordion.Control>
            <Accordion.Panel>
              <Textarea
                value={TEMP_state}
                onChange={(e) => {
                  setTEMP_state(e.currentTarget.value);
                }}
                variant="filled"
                radius="sm"
                resize="vertical"
                autosize
                minRows={2}
                maxRows={20}
                onKeyDown={getHotkeyHandler([
                  [
                    "mod+S",
                    () => {
                      let parsed = null;
                      try {
                        parsed = JSON.parse(TEMP_state);
                      } catch (e) {
                        alert("Invalid JSON");
                      }
                      setState({
                        ...parsed,
                      });
                    },
                  ],
                ])}
              />
              <Button
                fullWidth
                mt="xs"
                variant="light"
                color="red"
                onClick={() => {
                  setTEMP_state(JSON.stringify(state, null, 2));
                }}
              >
                Reset changes
              </Button>
              <Button
                fullWidth
                mt="xs"
                variant="light"
                onClick={() => {
                  let parsed = null;
                  try {
                    parsed = JSON.parse(TEMP_state);
                  } catch (e) {
                    alert("Invalid JSON");
                  }
                  setState({
                    ...parsed,
                  });
                }}
              >
                Save
              </Button>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Paper>
      <Container>
        <div style={{ display: state.activeTab == "home" ? "block" : "none" }}>
          <Home />
        </div>
        <div
          style={{ display: state.activeTab == "blackjack" ? "block" : "none" }}
        >
          <Blackjack />
        </div>
        <div style={{ display: state.activeTab == "poker" ? "block" : "none" }}>
          <Poker />
        </div>
        <div
          style={{ display: state.activeTab == "settings" ? "block" : "none" }}
        >
          <Settings />
        </div>
      </Container>
    </>
  );
}

export default App;
