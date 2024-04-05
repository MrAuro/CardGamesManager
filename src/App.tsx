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
import { atom, useRecoilState } from "recoil";
import { TAURI_STORE } from "./Root";
import Header from "./components/Header";
import Blackjack from "./pages/Blackjack";
import Players from "./pages/Players";
import Poker from "./pages/Poker";
import Settings from "./pages/Settings";

import "@/styles/App.css";

import DevTools from "./components/DevTools";
import { useHotkeys } from "react-hotkeys-hook";
import { notifications } from "@mantine/notifications";

export const HOTKEY_SELECTOR_A_ENABLED = atom({
  key: "hotkeySelectorA",
  default: false,
});

export const HOTKEY_SELECTOR_B_ENABLED = atom({
  key: "hotkeySelectorB",
  default: false,
});

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

  const [hotkeySelectorAEnabled, setHotkeySelectorAEnabled] =
    useRecoilState(HOTKEY_SELECTOR_A_ENABLED);
  const [hotkeySelectorBEnabled, setHotkeySelectorBEnabled] =
    useRecoilState(HOTKEY_SELECTOR_B_ENABLED);

  // Instead of doing this in a for each loop, we have to do it like this to prevent out of order hooks
  let keyAHold = keybindings.find((k) => k.action === "A (hold)");
  useHotkeys(
    keyAHold?.key || "F19", // super obscure key that is not used by anything (we disable it anyway)
    (e) => {
      if (e.type === "keydown" && !hotkeySelectorAEnabled) {
        setHotkeySelectorAEnabled(true);
      } else if (e.type === "keyup" && hotkeySelectorAEnabled) {
        setHotkeySelectorAEnabled(false);
      }
    },
    { keydown: true, keyup: true, enabled: keyAHold?.key ? true : false }
  );

  let keyAToggle = keybindings.find((k) => k.action === "A (toggle)");
  useHotkeys(
    keyAToggle?.key || "F19",
    (e) => {
      if (e.type === "keydown") {
        setHotkeySelectorAEnabled(!hotkeySelectorAEnabled);
      }
    },
    { keydown: true, enabled: keyAToggle?.key ? true : false }
  );

  let keyBHold = keybindings.find((k) => k.action === "B (hold)");
  useHotkeys(
    keyBHold?.key || "F19",
    (e) => {
      if (e.type === "keydown" && !hotkeySelectorBEnabled) {
        setHotkeySelectorBEnabled(true);
      } else if (e.type === "keyup" && hotkeySelectorBEnabled) {
        setHotkeySelectorBEnabled(false);
      }
    },
    { keydown: true, keyup: true, enabled: keyBHold?.key ? true : false }
  );

  let keyBToggle = keybindings.find((k) => k.action === "B (toggle)");
  useHotkeys(
    keyBToggle?.key || "F19",
    (e) => {
      if (e.type === "keydown") {
        setHotkeySelectorBEnabled(!hotkeySelectorBEnabled);
      }
    },
    { keydown: true, enabled: keyBToggle?.key ? true : false }
  );

  useEffect(() => {
    if (hotkeySelectorAEnabled) {
      notifications.show({
        id: "hotkeySelectorA-enabled",
        withCloseButton: false,
        autoClose: false,
        title: "Hotkey Selector A Enabled",
        message: null,
        radius: "md",
        color: "violet",
        withBorder: true,
        styles: {
          root: {
            backgroundColor: theme.colors.violet[8],
            padding: "10px",
            border: `5px solid white`,
          },
          title: {
            fontSize: "20px",
            textAlign: "center",
          },
        },
      });
    } else {
      notifications.hide("hotkeySelectorA-enabled");
    }

    if (hotkeySelectorBEnabled) {
      notifications.show({
        id: "hotkeySelectorB-enabled",
        withCloseButton: false,
        autoClose: false,
        title: "Hotkey Selector B Enabled",
        message: null,
        radius: "md",
        color: "teal",
        withBorder: true,
        styles: {
          root: {
            backgroundColor: theme.colors.teal[8],
            padding: "10px",
            border: `5px solid white`,
          },
          title: {
            fontSize: "20px",
            textAlign: "center",
          },
        },
      });
    } else {
      notifications.hide("hotkeySelectorB-enabled");
    }
  }, [hotkeySelectorAEnabled, hotkeySelectorBEnabled]);

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
