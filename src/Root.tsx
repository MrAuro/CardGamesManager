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
import { EMPTY_CARD } from "./utils/CardHelper";
import { Keybinding } from "./types/Keybindings";
import { DefaultKeybinds } from "./utils/DefaultKeybinds";
import { PokerGame, PokerPlayer, PokerSettings } from "./types/Poker";

export const TAURI_STORE = new Store(".data");

export const PLAYERS_STATE = atom<Player[]>({
  key: "PLAYERS",
  default: new Promise(async (resolve) => {
    let players = await TAURI_STORE.get("players");
    console.log("initial players", players);
    if (!players) {
      players = [];
      await TAURI_STORE.set("players", players);
    }

    resolve(players as Player[]);
  }),
});

export const KEYBINDINGS_STATE = atom<Keybinding[]>({
  key: "KEYBINDINGS",
  default: new Promise(async (resolve) => {
    let keybindings = await TAURI_STORE.get("keybindings");
    if (!keybindings) {
      console.log(`keybindings not found, setting to default`);
      keybindings = [...DefaultKeybinds];
      await TAURI_STORE.set("keybindings", keybindings);
    }

    resolve(keybindings as Keybinding[]);
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
        dealerCards: [EMPTY_CARD, EMPTY_CARD],
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

        blackjackPayout: 1.5,

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
    console.log(settings);

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

export const POKER_GAME_STATE = atom<PokerGame>({
  key: "POKER_GAME",
  default: new Promise(async (resolve) => {
    let game = await TAURI_STORE.get("pokerGame");
    if (!game) {
      game = {
        gameState: "PREROUND",
        currentTurn: "",
        communityCards: [],
        currentBet: 0,
      };
      await TAURI_STORE.set("pokerGame", game);
    }

    resolve(game as PokerGame);
  }),
});

export const POKER_PLAYERS_STATE = atom<PokerPlayer[]>({
  key: "POKER_PLAYERS",
  default: new Promise(async (resolve) => {
    let players = await TAURI_STORE.get("pokerPlayers");
    if (!players) {
      players = [];
      await TAURI_STORE.set("pokerPlayers", players);
    }

    resolve(players as PokerPlayer[]);
  }),
});

export const POKER_SETTINGS_STATE = atom<PokerSettings>({
  key: "POKER_SETTINGS",
  default: new Promise(async (resolve) => {
    let settings = await TAURI_STORE.get("pokerSettings");
    if (!settings) {
      settings = {
        forcedBetOption: "BLINDS",
        smallBlind: 5,
        bigBlind: 10,
        ante: 0,
      };
      await TAURI_STORE.set("pokerSettings", settings);
    }

    resolve(settings as PokerSettings);
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
        cornerOfEyeMode: false,
        chipsMode: false,
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
            <Notifications limit={3} />
            <App />
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
      <Button
        fullWidth
        mt="sm"
        variant="light"
        color="red"
        onClick={() => {
          TAURI_STORE.clear();
          window.location.reload();
        }}
      >
        Reset data
      </Button>
      <pre>{props.error.message}</pre>
      <pre>{props.error?.stack}</pre>
    </Container>
  );
}
