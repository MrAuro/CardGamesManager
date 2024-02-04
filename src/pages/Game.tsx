import { useRecoilState } from "recoil";
import { GameState, STATE } from "../App";
import { Button } from "@mantine/core";
import { Table } from "../components/Table";

export default function Game() {
  const [state, setState] = useRecoilState(STATE);

  switch (state.gameState) {
    case GameState.NONE:
      return (
        <Button
          fullWidth
          onClick={() => setState({ ...state, gameState: GameState.CREATING })}
        >
          Create Game
        </Button>
      );
    case GameState.CREATING:
      return <Table />;
  }
}
