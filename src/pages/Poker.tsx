import { useRecoilState } from "recoil";
import { STATE, State } from "../App";

export function Poker() {
  const [state, setState] = useRecoilState<State>(STATE);

  return <p>Poker</p>;
}
