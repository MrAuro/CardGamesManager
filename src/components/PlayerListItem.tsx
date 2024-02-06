import { useRecoilState } from "recoil";
import { STATE, State } from "../App";
import { Player } from "../types/Player";
import {
  ActionIcon,
  Container,
  Group,
  Paper,
  Text,
  rem,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";

export default function PlayerListItem(props: {
  player: Player;
  editPlayer: ((player: Player) => void) | null;
  my?: string;
  children?: React.ReactNode;
}) {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  if (props?.player == null) {
    console.warn("player is null", props);
    return;
  }

  return (
    <Paper
      withBorder
      radius="md"
      my={props.my ?? undefined}
      p="xs"
      styles={{
        root: {
          // height: "3rem",
          backgroundColor:
            colorScheme === "dark"
              ? theme.colors.dark[6]
              : theme.colors.gray[1],
          cursor: props.editPlayer != null ? "pointer" : "default",
        },
      }}
      onClick={() => {
        if (props.editPlayer != null) props.editPlayer(props.player);
      }}
    >
      <Container pl="xs">
        <Text size="xl" fw="bold" tt="capitalize">
          {props.player.name}
        </Text>
        <Text size="sm" c="dimmed">
          ${props.player.balance.toFixed(2)}
        </Text>
        {props.children}
      </Container>
    </Paper>
  );
}
