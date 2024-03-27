import { POKER_GAME_STATE } from "@/Root";
import { useRecoilState } from "recoil";
import PreRound from "./routes/PreRound";
import Round from "./routes/Round";

export default function Poker() {
  const [gameState] = useRecoilState(POKER_GAME_STATE);

  let component;

  if (gameState.gameState == "PREROUND") {
    component = <PreRound />;
  } else {
    component = <Round />;
  }

  return <>{component}</>;
}
