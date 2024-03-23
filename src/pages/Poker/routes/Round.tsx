import { POKER_GAME_STATE } from "@/Root";
import { Button } from "@mantine/core";
import { useRecoilState } from "recoil";

export default function Round() {
  const [pokerGame, setPokerGame] = useRecoilState(POKER_GAME_STATE);

  return (
    <>
      <Button
        onClick={() => {
          setPokerGame({
            ...pokerGame,
            gameState: "PREROUND",
          });
        }}
      >
        set preround
      </Button>
    </>
  );
}
