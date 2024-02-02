import {
  Container,
  Divider,
  MantineProvider,
  Title,
  Text,
} from "@mantine/core";
import { RecoilRoot, atom, selector, useRecoilValue } from "recoil";
import "./App.css";
import { theme } from "./theme";

import "@mantine/core/styles.css";
import { Counter } from "./components/counter";
import { ModalsProvider } from "@mantine/modals";
import { Game } from "./components/Game";
import { Header } from "./components/Header";
import { IconCards, IconHome, IconSettings } from "@tabler/icons-react";
import { Table } from "./components/Table";
import { Base } from "./components/Base";

export interface State {
  count: number;
  activeTab: string;
  scale: 1;
  gameState: GameState;
  players: Player[];
}

export type Player = {
  name: string;
  stack: number;
};

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
  count: 0,
  activeTab: "home",
  scale: 1,
  gameState: GameState.NONE,
  players: [],
};

export const STATE = atom({
  key: "state",
  default: {
    ...defaultState,
    ...JSON.parse(localStorage.getItem("state") || "{}"),
  },
});

const debouncedSetItem = debounce((key: any, value: any) => {
  localStorage.setItem(key, value);
  console.log("STORED");
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
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <ModalsProvider>
        <RecoilRoot>
          <Container>
            <Header />
            <Divider my="sm" />
            <Base />
          </Container>
        </RecoilRoot>
      </ModalsProvider>
    </MantineProvider>
  );
}

export default App;
