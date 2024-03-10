import { BLACKJACK_GAME_STATE } from "@/Root";
import { EMPTY_CARD } from "@/utils/CardHelper";
import { Button } from "@mantine/core";
import { useRecoilState } from "recoil";
import PostRound from "./routes/PostRound";
import PreRound from "./routes/PreRound";
import Round from "./routes/Round";

export default function Blackjack() {
  const [gameState, setGameState] = useRecoilState(BLACKJACK_GAME_STATE);

  let component;

  switch (gameState.gameState) {
    case "PREROUND":
      component = <PreRound />;
      break;
    case "ROUND":
      component = <Round />;
      break;
    case "POSTROUND":
      component = <PostRound />;
      break;
  }

  return <>{component} </>;
}
