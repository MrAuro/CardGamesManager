import { useRecoilState, useRecoilValue } from "recoil";
import { STATE, STATE_WATCHER, State } from "../App";
import { Button } from "@mantine/core";

export function Counter() {
  const [state, setState] = useRecoilState(STATE);
  const val = useRecoilValue<State>(STATE_WATCHER);

  return (
    <Button onClick={() => setState({ ...state, count: state.count + 1 })}>
      {val.count}
    </Button>
  );
}
