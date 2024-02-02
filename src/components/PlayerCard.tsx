import {
  useMantineTheme,
  NumberInput,
  Paper,
  Box,
  Group,
  Menu,
  ActionIcon,
  rem,
  Divider,
  Button,
  Text,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import {
  IconCurrencyDollar,
  IconChevronDown,
  IconPencil,
  IconCoin,
  IconBolt,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import { Card, Player } from "../utils/Game";
import PlayingCard from "./PlayingCard";
import { useRecoilState, useRecoilValue } from "recoil";
import { STATE, State, STATE_WATCHER } from "../App";
import { UseListStateHandlers } from "@mantine/hooks";

export default function PlayerCard(props: {
  name: string;
  turn: boolean;
  role: string;
  id: string;
  cards: Card[];
  handler: UseListStateHandlers<Player>;
}) {
  const theme = useMantineTheme();
  const [isBetting, setIsBetting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [state, setState] = useRecoilState(STATE);
  const val = useRecoilValue<State>(STATE_WATCHER);

  const openModal = () =>
    modals.openConfirmModal({
      title: `Placing Bet`,
      centered: true,
      radius: "md",
      children: (
        <NumberInput
          label="Bet Amount"
          allowNegative={false}
          decimalScale={2}
          fixedDecimalScale
          defaultValue={0}
          leftSection={<IconCurrencyDollar />}
        />
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onCancel: () => console.log("Cancel"),
      onConfirm: () => console.log("Confirmed"),
    });

  const openDeleteConfirmModal = () =>
    modals.openConfirmModal({
      title: "Delete player",
      children: "Are you sure that you want to delete this player?",
      labels: { confirm: `Delete ${props.name}`, cancel: "Cancel" },
      centered: true,
      confirmProps: { color: "red", variant: "light" },
      cancelProps: { color: "gray", variant: "light" },
      radius: "md",
      groupProps: { grow: true },
      onConfirm: () => {
        console.log("Player deleted");
        props.handler.filter((item) => item.id !== props.id);
      },
    });

  return (
    <Paper
      withBorder
      radius="md"
      styles={{
        root: {
          backgroundColor: props.turn
            ? theme.colors.dark[8]
            : theme.colors.dark[7],
        },
      }}
    >
      <Box m="xs">
        <Group grow justify="space-between">
          <div>
            <Text size={props.turn ? "xl" : "lg"} fw={props.turn ? 700 : 500}>
              {props.name}{" "}
              <Menu position="bottom-start">
                <Menu.Target>
                  <ActionIcon
                    variant="transparent"
                    color={theme.colors.dark[1]}
                    onClick={() => setShowMenu(!showMenu)}
                  >
                    <IconChevronDown
                      style={{ width: rem(20), height: rem(20) }}
                    />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Bought in with $12.23</Menu.Label>
                  <Menu.Divider />
                  <Menu.Label>Actions</Menu.Label>
                  <Menu.Item
                    leftSection={
                      <IconPencil style={{ width: rem(20), height: rem(20) }} />
                    }
                  >
                    Change Name
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <IconCoin style={{ width: rem(20), height: rem(20) }} />
                    }
                  >
                    Set Balance
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <IconBolt style={{ width: rem(20), height: rem(20) }} />
                    }
                  >
                    Force Turn
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <IconTrash style={{ width: rem(20), height: rem(20) }} />
                    }
                    color="red"
                    onClick={openDeleteConfirmModal}
                  >
                    Delete Player
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
              {/* {props.role && (
                    <Badge
                      ml="xs"
                      variant="light"
                      color={props.turn ? "blue" : "gray"}
                    >
                      {props.role}
                    </Badge>
                  )} */}
            </Text>
            <Text size={props.turn ? "md" : "sm"} c="dimmed">
              $21.23
            </Text>
          </div>
          <Group justify="flex-end">
            {props.cards.map((card, i) => (
              <PlayingCard key={i} card={card} />
            ))}
          </Group>
        </Group>
        <Divider my="xs" />
        <Group grow gap="xs" justify="center">
          <Button color="blue" variant="light" disabled={!props.turn}>
            Check
          </Button>
          <Button color="red" variant="light" disabled={!props.turn}>
            Fold
          </Button>
          <Button
            color="green"
            variant="light"
            disabled={!props.turn}
            onClick={openModal}
          >
            Bet
          </Button>
        </Group>
      </Box>
    </Paper>
  );
}
