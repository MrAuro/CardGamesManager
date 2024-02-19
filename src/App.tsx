import { Center, Container, Divider, Loader, Text } from "@mantine/core";
import { Page } from "./types/State";
import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Blackjack from "./pages/Blackjack";
import Players from "./pages/Players";
import Settings from "./pages/Settings";
import Poker from "./pages/Poker";
import { useRecoilState, useRecoilValue } from "recoil";
import { PLAYERS_STATE } from "./stores/Players";
import {
  BLACKJACK_GAME_STATE,
  BLACKJACK_PLAYERS_STATE,
  BLACKJACK_SETTINGS_STATE,
} from "./stores/Blackjack";
import { SETTINGS_STATE } from "./stores/Settings";
import { TAURI_STORE } from "./Root";
import { Player } from "./types/Player";
import { BlackjackGame, BlackjackPlayer, BlackjackSettings } from "./types/Blackjack";
import { Settings as SettingsType } from "./types/Settings";

export default function App() {
  const [activeTab, setActiveTab] = useState<Page>("Players");
  const [players, setPlayers] = useRecoilState(PLAYERS_STATE);
  const [blackjackGame, setBlackjackGame] = useRecoilState(BLACKJACK_GAME_STATE);
  const [blackjackPlayers, setBlackjackPlayers] = useRecoilState(BLACKJACK_PLAYERS_STATE);
  const [blackjackSettings, setBlackjackSettings] = useRecoilState(BLACKJACK_SETTINGS_STATE);
  const [settings, setSettings] = useRecoilState(SETTINGS_STATE);
  const [loading, setLoading] = useState(true);

  useMemo(async () => {
    let players = await TAURI_STORE.get("players");

    if (players) {
      setPlayers(players as Player[]);
    }

    let blackjackGame = await TAURI_STORE.get("blackjackGame");

    if (blackjackGame) {
      setBlackjackGame(blackjackGame as BlackjackGame);
    }

    let blackjackPlayers = await TAURI_STORE.get("blackjackPlayers");

    if (blackjackPlayers) {
      setBlackjackPlayers(blackjackPlayers as BlackjackPlayer[]);
    }

    let blackjackSettings = await TAURI_STORE.get("blackjackSettings");

    if (blackjackSettings) {
      setBlackjackSettings(blackjackSettings as BlackjackSettings);
    }

    let settings = await TAURI_STORE.get("settings");

    if (settings) {
      setSettings(settings as SettingsType);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    TAURI_STORE.set("players", players);
  }, [players]);

  useEffect(() => {
    TAURI_STORE.set("blackjackGame", blackjackGame);
  }, [blackjackGame]);

  useEffect(() => {
    TAURI_STORE.set("blackjackPlayers", blackjackPlayers);
  }, [blackjackPlayers]);

  useEffect(() => {
    TAURI_STORE.set("blackjackSettings", blackjackSettings);
  }, [blackjackSettings]);

  useEffect(() => {
    TAURI_STORE.set("settings", settings);
  }, [settings]);

  let content: JSX.Element = <Text>No content</Text>;
  switch (activeTab) {
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
      <Header active={activeTab} setActive={setActiveTab} />
      <Divider my="xs" />
      {loading ? (
        <Center>
          {" "}
          <Loader />
        </Center>
      ) : (
        <Container>{content}</Container>
      )}
    </>
  );
}
