import { useRecoilState } from "recoil";
import { GameState, STATE } from "../App";
import { Button } from "@mantine/core";

export default function Blackjack() {
  const [state, setState] = useRecoilState(STATE);

  return <>bj</>;
}
