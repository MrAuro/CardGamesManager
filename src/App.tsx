import { Container, Divider, MantineProvider, Title } from "@mantine/core";
import { RecoilRoot, atom, selector } from "recoil";
import "./App.css";
import { theme } from "./theme";

import "@mantine/core/styles.css";
import { Counter } from "./components/counter";
import { Game } from "./components/Game";

export interface State {
  count: number;
  gameState: GameState;
}

export enum GameState {
  NONE,
  CREATING,
}

export const defaultState: State = {
  count: 0,
  gameState: GameState.NONE,
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
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <RecoilRoot>
        <Container>
          <Title mt="sm">Poker Manager</Title>
          <Divider my="sm" />
          <Game />
        </Container>
      </RecoilRoot>
    </MantineProvider>
  );
}

export default App;
