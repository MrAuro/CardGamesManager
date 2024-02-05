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
  IconClubs,
  IconHome,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import { atom, selector, useRecoilState } from "recoil";
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
import Players from "./pages/Players";
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
    link: "PLAYERS",
    icon: <IconUsers size="1.4rem" />,
  },
  {
    label: "Blackjack",
    link: "BLACKJACK",
    icon: <IconCards size="1.4rem" />,
  },
  {
    label: "Poker",
    link: "POKER",
    icon: <IconClubs size="1.4rem" />,
  },
  {
    label: "Settings",
    link: "SETTINGS",
    icon: <IconSettings size="1.4rem" />,
  },
];

export const DEFAULT_STATE: State = {
  activeTab: "PLAYERS",
  scale: 1,

  currentGamePlaying: "NONE",

  showDebugInfo: false,

  poker: {
    forcedBetType: "BLINDS",
    bigBlind: 10,
    smallBlind: 5,
    ante: 1,
  },

  blackjack: {},
};

export interface State {
  activeTab: "PLAYERS" | "POKER" | "BLACKJACK" | "SETTINGS";
  scale: 1;

  currentGamePlaying: "NONE" | "POKER" | "BLACKJACK";

  showDebugInfo: boolean;

  poker: {
    forcedBetType: "BLINDS" | "ANTE" | "BLINDS+ANTE";
    bigBlind: number;
    smallBlind: number;
    ante: number;
  };

  blackjack: {};
}

export const STATE = atom({
  key: "STATE",
  default: {
    ...DEFAULT_STATE,
    ...JSON.parse(localStorage.getItem("STATE") || "{}"),
  },
});

const debouncedStoreState = debounce((key: any, value: any) => {
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

  useEffect(() => {
    debouncedStoreState("STATE", JSON.stringify(state));
  }, [state]);

  // Mantine uses fontSize for scaling
  document.documentElement.style.fontSize = `${state.scale * 100}%`;

  const [TEMP_state, setTEMP_state] = useState<string>(
    JSON.stringify(state, null, 2)
  );

  return (
    <>
      <Header />
      <Divider my="xs" />
      {state.showDebugInfo && (
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
      )}

      <Container>
        <div
          style={{ display: state.activeTab == "PLAYERS" ? "block" : "none" }}
        >
          <Players />
        </div>
        <div
          style={{ display: state.activeTab == "BLACKJACK" ? "block" : "none" }}
        >
          <Blackjack />
        </div>
        <div style={{ display: state.activeTab == "POKER" ? "block" : "none" }}>
          <Poker />
        </div>
        <div
          style={{ display: state.activeTab == "SETTINGS" ? "block" : "none" }}
        >
          <Settings />
        </div>
      </Container>
    </>
  );
}

export default App;
