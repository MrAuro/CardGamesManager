import { RecoilState, useRecoilState } from "recoil";
import { produce, Draft } from "immer";
import { useCallback } from "react";

type DraftFunction<T> = (draft: Draft<T>) => void;

export const useRecoilImmerState = <T>(atom: RecoilState<T>) => {
  const [state, setState] = useRecoilState(atom);
  return [
    state,
    useCallback(
      (valOrUpdater: T | DraftFunction<T>) =>
        setState(
          typeof valOrUpdater === "function"
            ? produce(valOrUpdater as DraftFunction<T>)
            : (valOrUpdater as T)
        ),
      [setState]
    ),
  ] as const;
};
