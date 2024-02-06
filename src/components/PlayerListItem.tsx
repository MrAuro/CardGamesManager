import { useRecoilState } from "recoil";
import { STATE, State } from "../App";
import { Player } from "../types/Player";
import {
  ActionIcon,
  Box,
  Container,
  Group,
  Paper,
  Text,
  rem,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { IconGripVertical, IconPencil } from "@tabler/icons-react";
import PlayingCard from "./PlayingCard";
import classes from "../styles/PlayingList.module.css";

export default function PlayerListItem(props: {
  player: Player;
  editPlayer: ((player: Player) => void) | null;
  my?: string;
  disabled?: boolean;
  showHandle?: boolean;
  provided?: any;
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
              ? !props.disabled
                ? theme.colors.dark[6]
                : theme.colors.dark[7]
              : !props.disabled
              ? theme.colors.gray[0]
              : theme.colors.gray[1],
          cursor: props.editPlayer != null ? "pointer" : "default",
          display: "flex", // Add this line to make the container a flex container
          alignItems: "center", // Vertically center the items
        },
      }}
      onClick={() => {
        if (props.editPlayer != null) props.editPlayer(props.player);
      }}
    >
      {props.showHandle && (
        <div {...props.provided.dragHandleProps} className={classes.dragHandle}>
          <IconGripVertical style={{ width: "auto" }} />{" "}
        </div>
      )}
      <Container
        style={{
          flex: 1,
          justifyContent: "space-between",
        }}
        pl="sm"
      >
        <Group justify="space-between">
          <Paper style={{ backgroundColor: "transparent" }}>
            <Text
              size={!props.disabled ? "xl" : "lg"}
              fw={!props.disabled ? "bold" : 500}
              tt="capitalize"
            >
              {props.player.name}
            </Text>
            <Text size="sm" c="dimmed">
              ${props.player.balance.toFixed(2)}
            </Text>
          </Paper>

          <Paper
            style={{
              backgroundColor: "transparent",

              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            {/* <Box ml="xs">
              <PlayingCard
              card="--"
              onClick={() => {}}
              disabled={!props.disabled}
              />
            </Box> */}
          </Paper>
        </Group>
        {props.children}
      </Container>
    </Paper>
  );
}
