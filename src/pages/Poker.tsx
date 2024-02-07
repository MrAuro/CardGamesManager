import { useRecoilState } from "recoil";
import { STATE, State } from "../App";
import { useCustomRecoilState } from "../utils/RecoilHelper";

export function Poker() {
  const [state, setState, modifyState] = useCustomRecoilState<State>(STATE);

  return <div>Poker</div>;
}
