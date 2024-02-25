import { Button, Container, MantineProvider, Title, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { RecoilRoot } from "recoil";
import App from "./App";
import { Store } from "tauri-plugin-store-api";
import { atom } from "recoil";
import { Settings } from "@/types/Settings";
import { BlackjackGame, BlackjackPlayer, BlackjackSettings } from "./types/Blackjack";
import { Player } from "./types/Player";

export const TAURI_STORE = new Store(".data");

export const PLAYERS_STATE = atom<Player[]>({
  key: "PLAYERS",
  default: new Promise(async (resolve) => {
    let players = await TAURI_STORE.get("players");
    if (!players) {
      players = [];
      await TAURI_STORE.set("players", players);
    }

    resolve(players as Player[]);
  }),
});

export const BLACKJACK_GAME_STATE = atom<BlackjackGame>({
  key: "BLACKJACK_GAME",
  default: new Promise(async (resolve) => {
    let game = await TAURI_STORE.get("blackjackGame");
    if (!game) {
      game = {
        gameState: "PREROUND",
        currentTurn: "",
        dealerCards: [],
        dealerFirstTime: true,
      };
      await TAURI_STORE.set("blackjackGame", game);
    }

    resolve(game as BlackjackGame);
  }),
});

export const BLACKJACK_SETTINGS = atom<BlackjackSettings>({
  key: "BLACKJACK_SETTINGS",
  default: new Promise(async (resolve) => {
    let settings = await TAURI_STORE.get("blackjackSettings");
    if (!settings) {
      settings = {
        decks: 2,
        dealerHitsSoft17: true,
        doubleAfterSplit: true,
        splitAces: true,
        splitAcesReceiveOneCard: true,

        blackjackPayout: 3 / 2,

        twentyOnePlusThreeEnabled: false,
        twentyOnePlusThreeFlushPayout: 5,
        twentyOnePlusThreeStraightPayout: 10,
        twentyOnePlusThreeThreeOfAKindPayout: 30,
        twentyOnePlusThreeStraightFlushPayout: 40,
        twentyOnePlusThreeThreeOfAKindSuitedPayout: 100,

        perfectPairsEnabled: false,
        perfectPairsMixedPayout: 6,
        perfectPairsColoredPayout: 12,
        perfectPairsSuitedPayout: 30,

        betBehindEnabled: false,
      };
      await TAURI_STORE.set("blackjackSettings", settings);
    }

    resolve(settings as BlackjackSettings);
  }),
});

export const BLACKJACK_PLAYERS_STATE = atom<BlackjackPlayer[]>({
  key: "BLACKJACK_PLAYERS",
  default: new Promise(async (resolve) => {
    let players = await TAURI_STORE.get("blackjackPlayers");
    if (!players) {
      players = [];
      await TAURI_STORE.set("blackjackPlayers", players);
    }

    resolve(players as BlackjackPlayer[]);
  }),
});

export const SETTINGS_STATE = atom<Settings>({
  key: "SETTINGS",
  default: new Promise(async (resolve) => {
    let settings = await TAURI_STORE.get("settings");
    if (!settings) {
      settings = {
        scale: 100,
        debug: false,
        activeTab: "Players",
      };
      await TAURI_STORE.set("settings", settings);
    }

    resolve(settings as Settings);
  }),
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider
      theme={createTheme({
        fontFamily: "Segoe UI, sans-serif",
        colors: {
          dark: [
            "#BFBFC2",
            "#A4A5A9",
            "#8E9196",
            "#595C63",
            "#34373D",
            "#292B30",
            "#212225",
            "#161719",
            "#101113",
            "#0C0D0F",
          ],
        },
        defaultRadius: "lg",
      })}
      defaultColorScheme="dark"
    >
      <RecoilRoot>
        <ErrorBoundary fallbackRender={fallbackRender}>
          <ModalsProvider
            modalProps={{
              radius: "md",
              centered: true,
            }}
          >
            <Container>
              <Notifications limit={3} />
              <App />
            </Container>
          </ModalsProvider>
        </ErrorBoundary>
      </RecoilRoot>
    </MantineProvider>
  </React.StrictMode>
);

function fallbackRender(props: { error: any; resetErrorBoundary: any }) {
  return (
    <Container mt="sm">
      <Title order={1}>An error occurred</Title>
      <Button fullWidth mt="sm" variant="light" onClick={props.resetErrorBoundary}>
        Retry
      </Button>
      <pre>{props.error.message}</pre>
      <pre>{props.error?.stack}</pre>
    </Container>
  );
}
