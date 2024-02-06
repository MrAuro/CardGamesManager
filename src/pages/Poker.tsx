import { useRecoilState } from "recoil";
import { STATE, State } from "../App";
import { useCustomRecoilState } from "../utils/Recoil";

export function Poker() {
  const [state, setState, modifyState] = useCustomRecoilState<State>(STATE);

  return <p>Poker</p>;
}
