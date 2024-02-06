import { RecoilState, useRecoilState } from "recoil";
import { State } from "../App";
import _ from "lodash";

// https://stackoverflow.com/a/47914631
type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

export function useCustomRecoilState<T>(recoilState: RecoilState<T>) {
  const [state, setState] = useRecoilState(recoilState);

  const modifyState = (newState: RecursivePartial<T>) => {
    const mergedState = _.merge({}, state, newState);
    setState(mergedState);
  };

  return [state, setState, modifyState] as const;
}
