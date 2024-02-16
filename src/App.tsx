import { Container, Divider, Text } from "@mantine/core";
import { Page } from "./types/State";
import { useState } from "react";
import Header from "./components/Header";
import Blackjack from "./pages/Blackjack";
import Players from "./pages/Players";
import Settings from "./pages/Settings";
import Poker from "./pages/Poker";

export default function App() {
  const [activeTab, setActiveTab] = useState<Page>("Players");

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
      <Container>{content}</Container>
    </>
  );
}
