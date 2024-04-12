import {
  BLACKJACK_GAME_STATE,
  BLACKJACK_PLAYERS_STATE,
  BLACKJACK_SETTINGS,
  CHIPS_STATE,
  KEYBINDINGS_STATE,
  PLAYERS_STATE,
  POKER_GAME_STATE,
  POKER_PLAYERS_STATE,
  POKER_SETTINGS_STATE,
  SETTINGS_STATE,
} from "@/Root";
import { AppShell, Container, Divider, Modal, Text, Title, useMantineTheme } from "@mantine/core";
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
import TouchscreenMenu from "./components/TouchscreenMenu";
import ChipBreakdown, { CHIP_BREAKDOWN_OPEN } from "./components/ChipBreakdown";
import { useLocalStorage } from "@mantine/hooks";
import { modals } from "@mantine/modals";

export const HOTKEY_SELECTOR_A_ENABLED = atom({
  key: "hotkeySelectorA",
  default: false,
});

export const HOTKEY_SELECTOR_B_ENABLED = atom({
  key: "hotkeySelectorB",
  default: false,
});

export const SPEECH_SYNTHESIS_MESSAGE = atom({
  key: "speechSynthesisMessage",
  default: "",
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
  const [chips] = useRecoilState(CHIPS_STATE);
  const [chipsLastSaved, setChipsLastSaved] = useState(0);

  const [firstTime, setFirstTime] = useLocalStorage({
    key: "first-time",
    defaultValue: true,
  });

  if (firstTime) {
    modals.openConfirmModal({
      title: "Notice",
      size: "xl",
      children: (
        <>
          <Title order={3}>License</Title>
          <Text>
            Card Games Manager is NOT free software. All rights reserved. This project is not open
            source. You may not use, modify, or distribute this project without explicit permission
            from the creator. Licenses may be purchased for commercial uses. Please contact the
            creator for more information.
          </Text>
          <Title mt="sm" order={3}>
            Disclaimer
          </Title>
          <Text>
            This tool is intended for entertainment purposes only and does not endorse or promote
            gambling. The use of this tool for gambling, especially where money is involved, is
            strictly prohibited and may be illegal in certain jurisdictions. The creators of this
            tool are not responsible for any misuse or illegal activities associated with its use.
            Please use this tool responsibly and in accordance with applicable laws and regulations.
            Additionally, this tool should not be the single source of truth for any card games. It
            is recommended to use physical cards or other trusted sources to verify the results of
            any games played with this tool. Any random number generation in this tool is not
            guaranteed to be truly random and should not be used for any serious or high-stakes
            games. This tool is provided as-is and without any warranty. The creators of this tool
            are not responsible for any damages or losses incurred from the use of this tool.
          </Text>
          <Divider my="sm" />
          <Text>
            By clicking "I agree" you acknowledge that you have read and agree to the terms and
            conditions outlined in the license and disclaimer above. If you do not agree to these
            terms, please close this window and do not use this tool. If you have previously agreed,
            you can not revoke your agreement. To view this notice again, scroll to the buttom of
            the Settings page. You can email the creator at auro@mrauro.dev
          </Text>
        </>
      ),
      labels: { confirm: "I Agree", cancel: "I Disagree" },
      onConfirm: () => {
        setFirstTime(false);
        modals.closeAll();
      },
      onCancel: async () => {
        window.close();
      },
    });
  }

  const [chipBreakdownOpen, setChipBreakdownOpen] = useRecoilState(CHIP_BREAKDOWN_OPEN);

  const [hotkeySelectorAEnabled, setHotkeySelectorAEnabled] =
    useRecoilState(HOTKEY_SELECTOR_A_ENABLED);
  const [hotkeySelectorBEnabled, setHotkeySelectorBEnabled] =
    useRecoilState(HOTKEY_SELECTOR_B_ENABLED);

  const [speechSynthesisMessage] = useRecoilState(SPEECH_SYNTHESIS_MESSAGE);
  useEffect(() => {
    if (!settings.tts) return;

    if (speechSynthesisMessage) {
      window.speechSynthesis.cancel();
      let msg = new SpeechSynthesisUtterance(speechSynthesisMessage);
      msg.rate = settings.ttsRate || 1.5;
      msg.pitch = settings.ttsPitch || 1;
      msg.volume = settings.ttsVolume || 1;
      window.speechSynthesis.speak(msg);
    }
  }, [speechSynthesisMessage, settings]);

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
    if (chipsLastSaved < Date.now() - 100) {
      setChipsLastSaved(Date.now());
      TAURI_STORE.set("chips", chips);
      console.log(`Chips:`, chips);
    }
  }, [chips]);

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

  let asideWidth: number | string = 0;
  let navbarWidth: number | string = 0;
  if (settings?.touchscreenMenu) {
    if (settings?.touchscreenMenuPosition == "left") {
      navbarWidth = `${settings?.touchscreenMenuWidth}%`;
    } else {
      asideWidth = `${settings?.touchscreenMenuWidth}%`;
    }
  }

  if (firstTime) return null;
  else
    return (
      <>
        <Modal
          title="Chip Breakdown"
          opened={chipBreakdownOpen}
          onClose={() => setChipBreakdownOpen(false)}
        >
          <ChipBreakdown />
        </Modal>
        <AppShell
          aside={{
            width: asideWidth,
            breakpoint: 0,
          }}
          navbar={{
            width: navbarWidth,
            breakpoint: 0,
          }}
        >
          <AppShell.Main>
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
          </AppShell.Main>
          {settings?.touchscreenMenu &&
            (settings?.touchscreenMenuPosition == "left" ? (
              <AppShell.Navbar>
                <TouchscreenMenu />
              </AppShell.Navbar>
            ) : (
              <AppShell.Aside>
                <TouchscreenMenu />
              </AppShell.Aside>
            ))}
        </AppShell>
      </>
    );
}
