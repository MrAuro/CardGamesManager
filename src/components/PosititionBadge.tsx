import { Badge, useMantineColorScheme } from "@mantine/core";
import { useRecoilValue } from "recoil";
import { STATE, State } from "../App";
import { Player, PlayerPosition } from "../utils/Game";

export default function PositionBadge(props: {
  player: Player;
  nextDealer: () => void;
}) {
  const state = useRecoilValue<State>(STATE);
  const { colorScheme } = useMantineColorScheme();

  let position: PlayerPosition = "NONE";

  let playerIndex = state.players.indexOf(props.player);
  if (playerIndex == state.dealerIndex) position = "btn";
  if (state.players.length >= 3) {
    if (playerIndex == (state.dealerIndex + 1) % state.players.length)
      position = "sb";
    if (playerIndex == (state.dealerIndex + 2) % state.players.length)
      position = "bb";
  }

  let color: string = "gray";

  switch (position) {
    case "btn":
      color = "grape";
      break;
    case "sb":
      color = "cyan";
      break;
    case "bb":
      color = "yellow";
      break;
  }

  if (position == "NONE") return null;
  else
    return (
      <Badge
        size="lg"
        fw="bold"
        variant={colorScheme === "dark" ? "light" : "filled"}
        color={color}
        ml="0.5rem"
        style={{
          cursor: position == "btn" ? "pointer" : "default",
        }}
        onClick={() => {
          if (position == "btn") props.nextDealer();
        }}
      >
        {position.toUpperCase()}
      </Badge>
    );
}
