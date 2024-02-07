import { Accordion, Button, Container, Divider, JsonInput, Paper, Title } from "@mantine/core";
import "@mantine/core/styles.css";
import { getHotkeyHandler } from "@mantine/hooks";
import { IconCards, IconClubs, IconSettings, IconUsers } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { atom } from "recoil";
import "./App.css";
import Header from "./components/Header";
import Blackjack from "./pages/Blackjack";
import Players from "./pages/Players";
import { Poker } from "./pages/Poker";
import Settings from "./pages/Settings";
import { DUMMY_PLAYER_NAMES, Player } from "./types/Player";
import { BlackjackGameState, BlackjackPlayer } from "./utils/BlackjackHelper";
import { useCustomRecoilState } from "./utils/RecoilHelper";
import { Card } from "./utils/CardHelper";
// import type { PlayingCard } from "@xpressit/winning-poker-hand-rank/src/types";

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
  players: [],
  currentGamePlaying: "NONE",
  showDebugInfo: false,
  fullTabWidth: 0,
  useKeybindings: false,

  poker: {
    forcedBetType: "BLINDS",
    bigBlind: 10,
    smallBlind: 5,
    ante: 1,
  },

  blackjack: {
    state: "NONE",
    players: [],
    turn: null,
    dealerCards: [],
    firstRound: false,
    pastGameSeenCards: [],
    seenCards: [],
    deckCount: 2,
    runningCount: 0,
  },
};

export interface State {
  activeTab: "PLAYERS" | "POKER" | "BLACKJACK" | "SETTINGS";
  scale: 1;
  players: Player[];
  currentGamePlaying: "NONE" | "POKER" | "BLACKJACK";
  showDebugInfo: boolean;
  fullTabWidth: number; // Used to calculate if the tabs should be shown as icons or text in the header
  useKeybindings: boolean;
  poker: {
    forcedBetType: "BLINDS" | "ANTE" | "BLINDS+ANTE";
    bigBlind: number;
    smallBlind: number;
    ante: number;
  };

  blackjack: {
    state: BlackjackGameState;
    players: BlackjackPlayer[];
    turn: string | null;
    dealerCards: Card[];
    firstRound: boolean;

    seenCards: Card[];
    pastGameSeenCards: Card[];
    deckCount: number;
    runningCount: number; // Hi-Lo count
  };
}

import Database from "tauri-plugin-sql-api";

const db = await Database.load("sqlite:data.db");
console.log(Date.now());
let initialData = (await db.select("SELECT * FROM data WHERE id = 1")) as any[];
console.log(`Initial data`, initialData);

if (initialData.length == 0 || initialData[0].data == null) {
  console.log("No data found, inserting default data");
  db.execute("INSERT INTO data (id, data) VALUES (?, ?)", [1, JSON.stringify(DEFAULT_STATE)]);
  initialData = (await db.select("SELECT * FROM data WHERE id = 1")) as any[];
}

export const STATE = atom({
  key: "STATE",
  default: {
    ...DEFAULT_STATE,
    ...JSON.parse(`${initialData[0].data}`),
  },
});

const debouncedStoreState = debounce((key: any, value: any) => {
  console.log("Saved", { key, value: JSON.parse(value) });
  // localStorage.setItem(key, value);
  db.execute("UPDATE data SET data = ? WHERE id = 1", [value]);
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
  const [state, setState, modifyState] = useCustomRecoilState<State>(STATE);

  useEffect(() => {
    debouncedStoreState("STATE", JSON.stringify(state));
  }, [state]);

  // Mantine uses fontSize for scaling
  document.documentElement.style.fontSize = `${state.scale * 100}%`;

  const [TEMP_state, setTEMP_state] = useState<string>(JSON.stringify(state, null, 2));

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
                <JsonInput
                  value={TEMP_state}
                  onChange={(e) => {
                    setTEMP_state(e);
                  }}
                  formatOnBlur
                  validationError="Invalid JSON"
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
          <Button
            mt="xs"
            variant="light"
            fullWidth
            onClick={() => {
              const players = DUMMY_PLAYER_NAMES.map((name) => {
                return {
                  name,
                  id: crypto.randomUUID(),
                  balance: Math.floor(Math.random() * 1000) / 100,
                };
              });

              let playersToAdd = [];
              for (let i = 0; i < 10; i++) {
                let randomIndex = Math.floor(Math.random() * players.length);
                playersToAdd.push(players[randomIndex]);
                players.splice(randomIndex, 1);
              }

              modifyState({
                players: playersToAdd,
              });
            }}
          >
            Populate Players
          </Button>
          <Button
            mt="xs"
            variant="light"
            color="red"
            fullWidth
            onClick={() => {
              modifyState({
                showDebugInfo: false,
              });
            }}
          >
            Close
          </Button>
        </Paper>
      )}

      <Container>
        <div style={{ display: state.activeTab == "PLAYERS" ? "block" : "none" }}>
          <Players />
        </div>
        <div style={{ display: state.activeTab == "BLACKJACK" ? "block" : "none" }}>
          <Blackjack />
        </div>
        <div style={{ display: state.activeTab == "POKER" ? "block" : "none" }}>
          <Poker />
        </div>
        <div style={{ display: state.activeTab == "SETTINGS" ? "block" : "none" }}>
          <Settings />
        </div>
      </Container>
    </>
  );
}

export default App;
