import { useRecoilState } from "recoil";
import { STATE, State } from "../App";
import {
  Button,
  Group,
  Select,
  rem,
  Text,
  Title,
  Divider,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Player } from "../types/Player";
import { useCustomRecoilState } from "../utils/Recoil";
import PlayerSelector from "../components/PlayingList";

export default function Blackjack() {
  const [state, setState, modifyState] = useCustomRecoilState<State>(STATE);

  const CollectingBets = (): React.ReactNode => {
    return "Collecting bets...";
  };

  let content = null;
  switch (state.blackjack.state) {
    case "NONE":
      content = (
        <>
          <Button
            fullWidth
            mt="sm"
            disabled={state.blackjack.players.length <= 0}
          >
            Start Game
          </Button>
          {state.blackjack.players.length <= 0 && (
            <Text ta="center" color="red" size="sm" mt="xs">
              You need at least one player to start a game
            </Text>
          )}
          <Divider my="md" />
          <Title order={2} mb="sm">
            Players
          </Title>
          <PlayerSelector />
        </>
      );
      break;
    case "COLLECTING_BETS":
      content = <CollectingBets />;
      break;
  }

  return content;
}
