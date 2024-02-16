import { useRecoilValue } from "recoil";
import PostRound from "./routes/PostRound";
import PreRound from "./routes/PreRound";
import Round from "./routes/Round";
import { BLACKJACK_GAME_STATE } from "../../stores/Blackjack";

export default function Blackjack() {
  const { gameState } = useRecoilValue(BLACKJACK_GAME_STATE);

  switch (gameState) {
    case "PREROUND":
      return <PreRound />;
    case "ROUND":
      return <Round />;
    case "POSTROUND":
      return <PostRound />;
  }
}
