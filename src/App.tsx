import {
  BLACKJACK_GAME_STATE,
  BLACKJACK_PLAYERS_STATE,
  BLACKJACK_SETTINGS,
  KEYBINDINGS_STATE,
  PLAYERS_STATE,
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

  const theme = useMantineTheme();

  useEffect(() => {
    if (playersLastSaved < Date.now() - 500) {
      setPlayersLastSaved(Date.now());
      TAURI_STORE.set("players", players);
    }
  }, [players]);

  useEffect(() => {
    if (keybindingsLastSaved < Date.now() - 500) {
      console.log(`saving keybindings`);
      setKeybindingsLastSaved(Date.now());
      TAURI_STORE.set("keybindings", keybindings);
    }
  }, [keybindings]);

  useEffect(() => {
    if (blackjackGameLastSaved < Date.now() - 500) {
      setBlackjackGameLastSaved(Date.now());
      TAURI_STORE.set("blackjackGame", blackjackGame);
    }
  }, [blackjackGame]);

  useEffect(() => {
    if (blackjackSettingsLastSaved < Date.now() - 500) {
      setBlackjackSettingsLastSaved(Date.now());
      TAURI_STORE.set("blackjackSettings", blackjackSettings);
    }
  }, [blackjackSettings]);

  useEffect(() => {
    if (blackjackPlayersLastSaved < Date.now() - 500) {
      setBlackjackPlayersLastSaved(Date.now());
      TAURI_STORE.set("blackjackPlayers", blackjackPlayers);
    }
  }, [blackjackPlayers]);

  useEffect(() => {
    if (settingsLastSaved < Date.now() - 500) {
      setSettingsLastSaved(Date.now());
      TAURI_STORE.set("settings", settings);
    }
  }, [settings]);

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
