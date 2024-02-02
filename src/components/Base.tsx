import { useRecoilValue } from "recoil";
import { STATE_WATCHER, State } from "../App";
import { Text, useMantineTheme } from "@mantine/core";
import { Game } from "./Game";
import { Settings } from "./Settings";

export function Base() {
  const val = useRecoilValue<State>(STATE_WATCHER);

  document.documentElement.style.fontSize = `${val.scale * 100}%`;

  let content = <Text>No content</Text>;

  switch (val.activeTab) {
    case "home":
      content = <Text>Home</Text>;
      break;
    case "game":
      content = <Game />;
      break;
    case "settings":
      content = <Settings />;
      break;
  }

  return content;
}
