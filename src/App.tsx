import {
  BLACKJACK_GAME_STATE,
  BLACKJACK_PLAYERS_STATE,
  BLACKJACK_SETTINGS,
  KEYBINDINGS_STATE,
  PLAYERS_STATE,
  POKER_GAME_STATE,
  POKER_PLAYERS_STATE,
  POKER_SETTINGS_STATE,
  SETTINGS_STATE,
} from "@/Root";
import { Container, Divider, Text, useMantineTheme } from "@mantine/core";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { TAURI_STORE } from "./Root";
import Header from "./components/Header";
import Blackjack from "./pages/Blackjack";
import Players from "./pages/Players";
import Poker from "./pages/Poker";
import Settings from "./pages/Settings";

import "@/styles/App.css";

import DevTools from "./components/DevTools";

export default function App() {
  const [players] = useRecoilState(PLAYERS_STATE);
  const [playersLastSaved, setPlayersLastSaved] = useState(0);
  const [keybindings] = useRecoilState(KEYBINDINGS_STATE);
  const [keybindingsLastSaved, setKeybindingsLastSaved] = useState(0);
  const [blackjackGame] = useRecoilState(BLACKJACK_GAME_STATE);
  const [blackjackGameLastSaved, setBlackjackGameLastSaved] = useState(0);
  const [blackjackSettings] = useRecoilState(BLACKJACK_SETTINGS);
  const [blackjackSettingsLastSaved, setBlackjackSettingsLastSaved] = useState(0);
  const [blackjackPlayers] = useRecoilState(BLACKJACK_PLAYERS_STATE);
  const [blackjackPlayersLastSaved, setBlackjackPlayersLastSaved] = useState(0);
  const [settings, setSettings] = useRecoilState(SETTINGS_STATE);
  const [settingsLastSaved, setSettingsLastSaved] = useState(0);
  const [pokerGame] = useRecoilState(POKER_GAME_STATE);
  const [pokerGameLastSaved, setPokerGameLastSaved] = useState(0);
  const [pokerSettings] = useRecoilState(POKER_SETTINGS_STATE);
  const [pokerSettingsLastSaved, setPokerSettingsLastSaved] = useState(0);
  const [pokerPlayers] = useRecoilState(POKER_PLAYERS_STATE);
  const [pokerPlayersLastSaved, setPokerPlayersLastSaved] = useState(0);

  const theme = useMantineTheme();

  useEffect(() => {
    if (playersLastSaved < Date.now() - 100) {
      setPlayersLastSaved(Date.now());
      TAURI_STORE.set("players", players);
    }
  }, [players]);

  useEffect(() => {
    if (keybindingsLastSaved < Date.now() - 100) {
      console.log(`saving keybindings`);
      setKeybindingsLastSaved(Date.now());
      TAURI_STORE.set("keybindings", keybindings);
    }
  }, [keybindings]);

  useEffect(() => {
    if (blackjackGameLastSaved < Date.now() - 100) {
      setBlackjackGameLastSaved(Date.now());
      TAURI_STORE.set("blackjackGame", blackjackGame);
    }
  }, [blackjackGame]);

  useEffect(() => {
    if (blackjackSettingsLastSaved < Date.now() - 100) {
      setBlackjackSettingsLastSaved(Date.now());
      TAURI_STORE.set("blackjackSettings", blackjackSettings);
    }
  }, [blackjackSettings]);

  useEffect(() => {
    if (blackjackPlayersLastSaved < Date.now() - 100) {
      setBlackjackPlayersLastSaved(Date.now());
      TAURI_STORE.set("blackjackPlayers", blackjackPlayers);
    }
  }, [blackjackPlayers]);

  useEffect(() => {
    if (settingsLastSaved < Date.now() - 100) {
      setSettingsLastSaved(Date.now());
      TAURI_STORE.set("settings", settings);
    }
  }, [settings]);

  useEffect(() => {
    if (pokerGameLastSaved < Date.now() - 100) {
      setPokerGameLastSaved(Date.now());
      TAURI_STORE.set("pokerGame", pokerGame);
    }
  }, [pokerGame]);

  useEffect(() => {
    if (pokerSettingsLastSaved < Date.now() - 100) {
      setPokerSettingsLastSaved(Date.now());
      TAURI_STORE.set("pokerSettings", pokerSettings);
    }
  }, [pokerSettings]);

  useEffect(() => {
    if (pokerPlayersLastSaved < Date.now() - 100) {
      setPokerPlayersLastSaved(Date.now());
      TAURI_STORE.set("pokerPlayers", pokerPlayers);
    }
  }, [pokerPlayers]);

  useEffect(() => {
    if (!settings.cornerOfEyeMode) {
      document.body.style.backgroundColor = theme.colors.dark[7];
    }
  }, [settings.cornerOfEyeMode]);

  document.documentElement.style.fontSize = `${settings.scale}%`;

  let content: JSX.Element = <Text>No content</Text>;
  switch (settings.activeTab) {
    case "Players":
      content = <Players />;
      break;

    case "Blackjack":
      content = <Blackjack />;
      break;

    case "Poker":
      content = <Poker />;
      break;

    case "Settings":
      content = <Settings />;
      break;
  }

  return (
    <>
      <Container>
        <Header
          active={settings.activeTab}
          setActive={(tab) => {
            setSettings({ ...settings, activeTab: tab });
          }}
        />
        <Divider my="xs" />
        {settings.debug ? (
          <>
            <DevTools />
            <Divider my="xs" />
          </>
        ) : null}
        <Container>{content}</Container>
      </Container>
    </>
  );
}
