import { Badge, useMantineColorScheme } from "@mantine/core";
import { useRecoilValue } from "recoil";
import { STATE_WATCHER, State } from "../App";
import { Player, PlayerPosition } from "../utils/Game";

export default function PositionBadge(props: {
  player: Player;
  nextDealer: () => void;
}) {
  const val = useRecoilValue<State>(STATE_WATCHER);
  const { colorScheme } = useMantineColorScheme();

  let position: PlayerPosition = "NONE";

  console.log(`PLAYER ${props.player.name} INDEX ${val.dealerIndex}`);

  let playerIndex = val.players.indexOf(props.player);
  if (playerIndex == val.dealerIndex) position = "btn";
  if (val.players.length >= 3) {
    if (playerIndex == (val.dealerIndex + 1) % val.players.length)
      position = "sb";
    if (playerIndex == (val.dealerIndex + 2) % val.players.length)
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
