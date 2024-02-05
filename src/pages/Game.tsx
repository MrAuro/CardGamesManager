import { useRecoilState } from "recoil";
import { GameState, STATE } from "../App";
import { Button } from "@mantine/core";
import { Table } from "../components/Table";

export default function Game() {
  const [state, setState] = useRecoilState(STATE);

  return <Table />;
}
