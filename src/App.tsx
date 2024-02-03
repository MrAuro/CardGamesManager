import { Container, Divider, Text } from "@mantine/core";
import "@mantine/core/styles.css";
import { IconCards, IconHome, IconSettings } from "@tabler/icons-react";
import { atom, selector, useRecoilValue } from "recoil";
import "./App.css";
import Header from "./components/Header";
import Game from "./pages/Game";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import { Card, Player } from "./utils/Game";

export interface State {
  activeTab: string;
  scale: 1;

  gameState: GameState;
  players: Player[];
  communityCards: Card[];
  currentPlayer: number;
  dealerIndex: number;
  inRound: boolean;
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
  currentPlayer: 0,
  dealerIndex: 0,
  inRound: false,
};

export const STATE = atom({
  key: "state",
  default: {
    ...defaultState,
    ...JSON.parse(localStorage.getItem("state") || "{}"),
  },
});

const debouncedSetItem = debounce((key: any, value: any) => {
  console.log("Set item", key, value);
  localStorage.setItem(key, value);
}, 300);

export const STATE_WATCHER = selector({
  key: "stateWatcher",
  get: ({ get }) => {
    const curr = get(STATE);
    debouncedSetItem("state", JSON.stringify(curr));
    return curr;
  },
});

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
  const val = useRecoilValue<State>(STATE_WATCHER);

  // Mantine uses fontSize for scaling
  document.documentElement.style.fontSize = `${val.scale * 100}%`;

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
        <div style={{ display: val.activeTab == "home" ? "block" : "none" }}>
          <Home />
        </div>
        <div style={{ display: val.activeTab == "game" ? "block" : "none" }}>
          <Game />
        </div>
        <div
          style={{ display: val.activeTab == "settings" ? "block" : "none" }}
        >
          <Settings />
        </div>
      </Container>
    </>
  );
}

export default App;
