import { Badge, useMantineColorScheme } from "@mantine/core";
import { useRecoilValue } from "recoil";
import { STATE, State } from "../App";
import { Player, PlayerPosition } from "../utils/PokerHelper";

export default function PositionBadge(props: { player: Player }) {
  const state = useRecoilValue<State>(STATE);
  const { colorScheme } = useMantineColorScheme();

  let position: PlayerPosition = "NONE";

  let playerIndex = state.players.indexOf(props.player);

  if (state.players[playerIndex].position == "btn") position = "btn";

  if (state.forcedBetType == "BLINDS") {
    if (state.players[playerIndex].position == "sb") position = "sb";
    if (state.players[playerIndex].position == "bb") position = "bb";
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
          cursor: "default",
        }}
      >
        {position.toUpperCase()}
      </Badge>
    );
}
