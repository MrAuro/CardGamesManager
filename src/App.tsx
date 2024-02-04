import { Container, Divider } from "@mantine/core";
import "@mantine/core/styles.css";
import { IconCards, IconHome, IconSettings } from "@tabler/icons-react";
import { atom, useRecoilState } from "recoil";
import "./App.css";
import Header from "./components/Header";
import Game from "./pages/Game";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import { Card, Player } from "./utils/Game";
import { useEffect } from "react";
import { rankHands } from "@xpressit/winning-poker-hand-rank";
import { HandRank, PlayingCard } from "./types/PokerHand";
// import type { PlayingCard } from "@xpressit/winning-poker-hand-rank/src/types";

export interface State {
  activeTab: string;
  scale: 1;

  gameState: GameState;
  players: Player[];
  communityCards: Card[];
  currentPlayerIndex: number;
  dealerIndex: number;
  inRound: boolean;
  usedCards: Card[];
}

export enum GameState {
  NONE,
  CREATING,
}

export const ROUTES = [
  {
    label: "Home",
    link: "home",
    icon: <IconHome size="1.4rem" />,
  },
  {
    label: "Game",
    link: "game",
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

  gameState: GameState.NONE,
  players: [],
  communityCards: new Array(5).fill({ suit: "NONE", rank: "NONE" }),
  currentPlayerIndex: 0,
  dealerIndex: 0,
  inRound: false,
  usedCards: [],
};

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
  default: [] as HandRank[],
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
  const [state] = useRecoilState<State>(STATE);
  const [, setUsedCards] = useRecoilState<Card[]>(USED_CARDS);
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

    // Check if all cards are set
    if (
      state.communityCards.filter((card) => card.rank != "NONE").length == 5 &&
      state.players.every(
        (player) =>
          player.cards[0].rank != "NONE" && player.cards[1].rank != "NONE"
      )
    ) {
      let playerHands: [any, any][] = state.players.map((player) => [
        `${player.cards[0].rank.replace(
          "10",
          "T"
        )}${player.cards[0].suit[0].toUpperCase()}` as PlayingCard,
        `${player.cards[1].rank.replace(
          "10",
          "T"
        )}${player.cards[1].suit[0].toUpperCase()}` as any,
      ]);

      const handsResult: HandRank[] = rankHands(
        "texas",
        [
          `${state.communityCards[0].rank.replace(
            "10",
            "T"
          )}${state.communityCards[0].suit[0].toUpperCase()}` as PlayingCard,
          `${state.communityCards[1].rank.replace(
            "10",
            "T"
          )}${state.communityCards[1].suit[0].toUpperCase()}` as PlayingCard,
          `${state.communityCards[2].rank.replace(
            "10",
            "T"
          )}${state.communityCards[2].suit[0].toUpperCase()}` as PlayingCard,
          `${state.communityCards[3].rank.replace(
            "10",
            "T"
          )}${state.communityCards[3].suit[0].toUpperCase()}` as PlayingCard,
          `${state.communityCards[4].rank.replace(
            "10",
            "T"
          )}${state.communityCards[4].suit[0].toUpperCase()}` as PlayingCard,
        ],
        playerHands
      );

      console.log("Hands", handsResult);
      setHands(handsResult);
    } else {
      setHands([]);
    }
  }, [state]);

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

  return (
    <>
      <Header />
      <Divider my="xs" />
      <Container>
        <div style={{ display: state.activeTab == "home" ? "block" : "none" }}>
          <Home />
        </div>
        <div style={{ display: state.activeTab == "game" ? "block" : "none" }}>
          <Game />
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
