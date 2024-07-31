import { Button, Container, MantineProvider, Title, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import { ModalsProvider } from "@mantine/modals";
import { notifications, Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { RecoilRoot } from "recoil";
import App from "./App";
import { Store } from "tauri-plugin-store-api";
import { atom } from "recoil";
import { Chip, Settings } from "@/types/Settings";
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
        currentBets: {},
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
        ante: 1,
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
        touchscreenMenu: false,
        touchscreenMenuPosition: "right",
        touchscreenMenuWidth: 30,
        touchscreenMenuChipsColumns: 3,
        touchscreenMenuCalculator: true,
        tts: false,
        ttsVoice: "Microsoft David Desktop - English (United States)",
        ttsRate: 1,
        ttsPitch: 1,
        geminiApiKey: "",
        chips: [],
      };
      await TAURI_STORE.set("settings", settings);
    }

    resolve(settings as Settings);
  }),
});

export const CHIPS_STATE = atom<Chip[]>({
  key: "CHIPS",
  default: new Promise(async (resolve) => {
    let chips = await TAURI_STORE.get("chips");
    if (!chips) {
      chips = [];
      await TAURI_STORE.set("chips", chips);
    }

    resolve(chips as Chip[]);
  }),
});

setInterval(() => {
  console.log(`Autosaving...`);
  TAURI_STORE.save();
}, 1000 * 60);

import * as Sentry from "@sentry/react";

if (process.env.NODE_ENV === "production")
  Sentry.init({
    dsn: "https://974f6beb8a6de4c30bbe28b8d7c7c00d@o4505139595575296.ingest.us.sentry.io/4507600938401792",
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: 0.1, //  Capture 100% of the transactions
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
    beforeSend(event) {
      if (event.exception && event.event_id) {
        Sentry.showReportDialog({ eventId: event.event_id });
      }
      return event;
    },
  });

window.addEventListener("error", (event) => {
  notifications.show({
    title: "An error occurred",
    message: event.message,
    color: "red",
  });
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider
      theme={createTheme({
        fontFamily: `${localStorage.getItem("FONT_FAMILY") || "Inter"}, Segoe UI, sans-serif`,
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
