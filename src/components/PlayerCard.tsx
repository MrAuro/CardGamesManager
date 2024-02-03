import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Grid,
  Group,
  Menu,
  Modal,
  NumberInput,
  Paper,
  Text,
  TextInput,
  rem,
  useMantineTheme,
} from "@mantine/core";
import {
  UseListStateHandlers,
  getHotkeyHandler,
  useDisclosure,
  useFocusTrap,
  useMediaQuery,
} from "@mantine/hooks";
import { modals } from "@mantine/modals";
import {
  IconBolt,
  IconChevronDown,
  IconCoin,
  IconCurrencyDollar,
  IconPencil,
  IconTrash,
  IconUser,
  IconUserFilled,
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { STATE, STATE_WATCHER, State } from "../App";
import { Card, Player } from "../utils/Game";
import PlayingCard from "./PlayingCard";
import { notifications } from "@mantine/notifications";

export default function PlayerCard(props: {
  name: string;
  turn: boolean;
  role: string;
  id: string;
  cards: Card[];
  balance: number;
  handler: UseListStateHandlers<Player>;
}) {
  const theme = useMantineTheme();
  const [isBetting, setIsBetting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [state, setState] = useRecoilState(STATE);
  const val = useRecoilValue<State>(STATE_WATCHER);

  const [name, setName] = useState(props.name);
  const [balance, setBalance] = useState(props.balance);
  const [editModalOpened, { open, close }] = useDisclosure(false);

  const [bet, setBet] = useState<number | string>("");

  const openDeleteConfirmModal = () =>
    modals.openConfirmModal({
      title: "Delete Player",
      children: "Are you sure that you want to delete this player?",
      labels: { confirm: `Delete ${props.name}`, cancel: "Cancel" },
      confirmProps: { color: "red", variant: "light" },
      cancelProps: { color: "gray", variant: "light" },
      groupProps: { grow: true },
      onConfirm: () => {
        props.handler.filter((item) => item.id !== props.id);
        notifications.show({
          message: "Player Deleted",
          color: "red",
        });
      },
    });

  const savePlayer = () => {
    modals.closeAll();
    props.handler.applyWhere(
      (item) => item.id === props.id,
      (item) => ({ ...item, name, balance })
    );
    close();
    notifications.show({
      message: "Player Updated",
      color: "green",
    });
  };

  const placeBet = () => {
    console.log("Bet placed");
    setIsBetting(false);
    // ...
    setBet("");
  };

  const cancelBet = () => {
    console.log("Bet canceled");
    setBet("");
    setIsBetting(false);
  };

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

                <Modal
                  opened={editModalOpened}
                  onClose={close}
                  title="Edit Player"
                  centered
                  radius="md"
                >
                  <>
                    <TextInput
                      data-autofocus
                      label="Player Name"
                      value={name}
                      onChange={(event) => setName(event.currentTarget.value)}
                      onKeyDown={getHotkeyHandler([["enter", savePlayer]])}
                      radius="md"
                      leftSection={<IconUserFilled />}
                    />
                    <NumberInput
                      label="Player Balance"
                      allowNegative={false}
                      decimalScale={2}
                      onKeyDown={getHotkeyHandler([["enter", savePlayer]])}
                      fixedDecimalScale
                      thousandSeparator=","
                      mt="md"
                      radius="md"
                      leftSection={<IconCurrencyDollar />}
                      value={balance}
                      onChange={(value) =>
                        setBalance(
                          isNaN(parseFloat(`${value}`))
                            ? 0
                            : parseFloat(`${value}`)
                        )
                      }
                    />
                    <Button
                      fullWidth
                      mt="md"
                      variant="light"
                      onClick={savePlayer}
                    >
                      Save
                    </Button>
                  </>
                </Modal>

                <Menu.Dropdown>
                  <Menu.Label>Bought in with $12.23</Menu.Label>
                  <Menu.Divider />
                  <Menu.Label>Actions</Menu.Label>
                  <Menu.Item
                    leftSection={
                      <IconPencil style={{ width: rem(20), height: rem(20) }} />
                    }
                    onClick={open}
                  >
                    Edit Player
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
              ${props.balance.toFixed(2)}
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
          {isBetting ? (
            <>
              <Grid gutter="xs">
                <Grid.Col span={{ base: 12, xs: 8 }}>
                  <NumberInput
                    allowNegative={false}
                    autoFocus
                    onKeyDown={getHotkeyHandler([
                      ["Enter", () => placeBet()],
                      ["Escape", () => cancelBet()],
                    ])}
                    decimalScale={2}
                    fixedDecimalScale
                    thousandSeparator=","
                    radius="md"
                    leftSection={<IconCurrencyDollar />}
                    value={bet}
                    onChange={(value) => setBet(parseFloat(`${value}`))}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 2 }}>
                  <Button
                    variant="light"
                    fullWidth
                    color="gray"
                    onClick={cancelBet}
                  >
                    Back
                  </Button>
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 2 }}>
                  <Button
                    variant="light"
                    fullWidth
                    color="green"
                    onClick={placeBet}
                  >
                    Bet
                  </Button>
                </Grid.Col>
              </Grid>
            </>
          ) : (
            <>
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
                onClick={() => {
                  setIsBetting(true);
                }}
              >
                Bet
              </Button>
            </>
          )}
        </Group>
      </Box>
    </Paper>
  );
}
