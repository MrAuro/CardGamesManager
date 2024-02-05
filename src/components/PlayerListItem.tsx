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
  editPlayer: (player: Player) => void;
}) {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  return (
    <Paper
      withBorder
      radius="md"
      my="xs"
      p="xs"
      styles={{
        root: {
          // height: "3rem",
          backgroundColor:
            colorScheme === "dark"
              ? theme.colors.dark[6]
              : theme.colors.gray[1],
        },
      }}
    >
      <Group grow>
        <Container>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Text size={rem(22)} pt="0.4rem" fw="bold" tt="capitalize">
              {props.player.name}
            </Text>
            <ActionIcon
              variant="transparent"
              ml="0.2rem"
              radius="xs"
              onClick={() => {
                props.editPlayer(props.player);
              }}
            >
              <IconPencil
                size="1.3rem"
                color={colorScheme == "dark" ? theme.colors.dark[0] : "black"}
              />
            </ActionIcon>
          </div>
          <Text size="md" c="dimmed" mt={rem(4)} mb={rem(4)}>
            ${props.player.balance.toFixed(2)}
          </Text>
        </Container>
      </Group>
    </Paper>
  );
}
