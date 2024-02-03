import {
  ActionIcon,
  Box,
  Button,
  Center,
  Container,
  Divider,
  Grid,
  Group,
  Menu,
  Modal,
  NumberInput,
  Paper,
  SimpleGrid,
  Text,
  TextInput,
  rem,
  useComputedColorScheme,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import {
  UseListStateHandlers,
  getHotkeyHandler,
  useDisclosure,
} from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications, showNotification } from "@mantine/notifications";
import {
  IconBolt,
  IconChevronDown,
  IconClubsFilled,
  IconCurrencyDollar,
  IconDiamondFilled,
  IconDiamondsFilled,
  IconHeartFilled,
  IconPencil,
  IconSpadeFilled,
  IconTrash,
  IconUserFilled,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { STATE, STATE_WATCHER, State } from "../App";
import {
  Card,
  CardRank,
  CardSuit,
  Player,
  rankToName,
  suitToName,
} from "../utils/Game";
import PlayingCard from "./PlayingCard";

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
  const [editName, setEditName] = useState(name);
  const [balance, setBalance] = useState(props.balance);
  const [editBalance, setEditBalance] = useState(balance);
  const [editModalOpened, { open, close }] = useDisclosure(false);

  const [cards, setCards] = useState<Card[]>(props.cards);

  const [setCardModelOpened, { open: openSetCard, close: closeSetCard }] =
    useDisclosure(false);
  const [setCardSuit, setSetCardSuit] = useState<CardSuit>("NONE");
  const [setCardRank, setSetCardRank] = useState<CardRank>("NONE");
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(0);

  useEffect(() => {
    props.handler.applyWhere(
      (item) => item.id === props.id,
      (item) => ({ ...item, name, balance })
    );
  }, [name, balance]);

  const { colorScheme } = useMantineColorScheme();

  const [bet, setBet] = useState<number | string>("");

  let turn = name === "turn" ? true : false;

  const openDeleteConfirmModal = () =>
    modals.openConfirmModal({
      title: "Delete Player",
      children: "Are you sure that you want to delete this player?",
      labels: { confirm: `Delete "${name}"`, cancel: "Cancel" },
      confirmProps: { color: "red" },
      cancelProps: { color: "gray" },
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
    setName(editName);
    setBalance(editBalance);

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

  const revertPlayer = () => {
    setEditName(name);
    setEditBalance(balance);
    close();
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

  const setCard = (i: number) => {
    openSetCard();
  };

  const saveCard = () => {
    console.log("Card set");

    let _cards = [...cards];
    if (setCardRank == "NONE" || setCardSuit == "NONE")
      _cards[selectedCardIndex] = { suit: "NONE", rank: "NONE" };
    else _cards[selectedCardIndex] = { suit: setCardSuit, rank: setCardRank };

    props.handler.applyWhere(
      (item) => item.id === props.id,
      (item) => ({ ...item, cards: [cards[0], cards[1]] })
    );
    setCards(_cards);
    closeSetCard();

    if (setCardRank == "NONE" || setCardSuit == "NONE") {
      showNotification({
        title: "Card Set",
        message: `Card removed`,
        color: "blue",
      });
    } else {
      setSetCardRank("NONE");
      setSetCardSuit("NONE");

      showNotification({
        title: "Card Set",
        message: `Card set to ${rankToName(setCardRank)} of ${suitToName(
          setCardSuit
        )}`,
        color: "blue",
      });
    }
  };

  const removeCard = (card: Card) => {
    console.log("Card removed");

    let _cards = [...cards];
    _cards[_cards.indexOf(card)] = { suit: "NONE", rank: "NONE" };
    props.handler.applyWhere(
      (item) => item.id === props.id,
      (item) => ({ ...item, cards: [cards[0], cards[1]] })
    );
    setCards(_cards);
  };

  return (
    <Paper
      withBorder
      radius="md"
      styles={{
        root: {
          backgroundColor:
            colorScheme == "dark"
              ? turn
                ? theme.colors.dark[8]
                : theme.colors.dark[7]
              : turn
              ? "#e6e6e6"
              : theme.colors.gray[0],
        },
      }}
    >
      <Box m="xs">
        <Group grow justify="space-between">
          <div>
            <Text size={turn ? "xl" : "lg"} fw={turn ? 700 : 500}>
              {name}{" "}
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
                  opened={setCardModelOpened}
                  onClose={saveCard}
                  title="Set Card"
                  centered
                  radius="md"
                >
                  <>
                    <Group justify="center" grow>
                      <ActionIcon
                        radius="sm"
                        size="xl"
                        variant={setCardSuit == "clubs" ? "filled" : "outline"}
                        onClick={() => setSetCardSuit("clubs")}
                        color="gray.0"
                        styles={{
                          icon: {
                            color:
                              setCardSuit == "clubs"
                                ? theme.colors.dark[8]
                                : "white",
                          },
                        }}
                      >
                        <IconClubsFilled />
                      </ActionIcon>
                      <ActionIcon
                        radius="sm"
                        size="xl"
                        variant={
                          setCardSuit == "diamonds" ? "filled" : "outline"
                        }
                        onClick={() => setSetCardSuit("diamonds")}
                        color="#ff2626"
                      >
                        <IconDiamondsFilled />
                      </ActionIcon>
                      <ActionIcon
                        radius="sm"
                        size="xl"
                        variant={setCardSuit == "spades" ? "filled" : "outline"}
                        onClick={() => setSetCardSuit("spades")}
                        color="gray.0"
                        styles={{
                          icon: {
                            color:
                              setCardSuit == "spades"
                                ? theme.colors.dark[8]
                                : "white",
                          },
                        }}
                      >
                        <IconSpadeFilled />
                      </ActionIcon>
                      <ActionIcon
                        radius="sm"
                        size="xl"
                        variant={setCardSuit == "hearts" ? "filled" : "outline"}
                        onClick={() => setSetCardSuit("hearts")}
                        color="#ff2626"
                      >
                        <IconHeartFilled />
                      </ActionIcon>
                    </Group>
                    <Divider my="md" />
                    {/* 2,3,4,5,6
                        7,8,9,T
                        J,Q,K,A */}
                    <Group grow>
                      <SimpleGrid
                        cols={{ sm: 7, xs: 2 }}
                        spacing="xs"
                        verticalSpacing="xs"
                      >
                        <Button
                          radius="md"
                          size="compact-xl"
                          fullWidth
                          p="xs"
                          fw="bold"
                          justify="center"
                          variant={setCardRank == "2" ? "filled" : "outline"}
                          onClick={() => {
                            setSetCardRank("2");
                          }}
                        >
                          {" "}
                          2
                        </Button>
                        <Button
                          radius="md"
                          size="compact-xl"
                          fullWidth
                          p="xs"
                          fw="bold"
                          justify="center"
                          variant={setCardRank == "3" ? "filled" : "outline"}
                          onClick={() => {
                            setSetCardRank("3");
                          }}
                        >
                          {" "}
                          3
                        </Button>
                        <Button
                          radius="md"
                          size="compact-xl"
                          fullWidth
                          p="xs"
                          fw="bold"
                          justify="center"
                          variant={setCardRank == "4" ? "filled" : "outline"}
                          onClick={() => {
                            setSetCardRank("4");
                          }}
                        >
                          {" "}
                          4
                        </Button>
                        <Button
                          radius="md"
                          size="compact-xl"
                          fullWidth
                          p="xs"
                          fw="bold"
                          justify="center"
                          variant={setCardRank == "5" ? "filled" : "outline"}
                          onClick={() => {
                            setSetCardRank("5");
                          }}
                        >
                          {" "}
                          5
                        </Button>
                        <Button
                          radius="md"
                          size="compact-xl"
                          fullWidth
                          p="xs"
                          fw="bold"
                          justify="center"
                          variant={setCardRank == "6" ? "filled" : "outline"}
                          onClick={() => {
                            setSetCardRank("6");
                          }}
                        >
                          {" "}
                          6
                        </Button>
                        <Button
                          radius="md"
                          size="compact-xl"
                          fullWidth
                          p="xs"
                          fw="bold"
                          justify="center"
                          variant={setCardRank == "7" ? "filled" : "outline"}
                          onClick={() => {
                            setSetCardRank("7");
                          }}
                        >
                          {" "}
                          7
                        </Button>
                        <Button
                          radius="md"
                          size="compact-xl"
                          fullWidth
                          p="xs"
                          fw="bold"
                          justify="center"
                          variant={setCardRank == "8" ? "filled" : "outline"}
                          onClick={() => {
                            setSetCardRank("8");
                          }}
                        >
                          {" "}
                          8
                        </Button>
                        <Button
                          radius="md"
                          size="compact-xl"
                          fullWidth
                          p="xs"
                          fw="bold"
                          justify="center"
                          variant={setCardRank == "9" ? "filled" : "outline"}
                          onClick={() => {
                            setSetCardRank("9");
                          }}
                        >
                          {" "}
                          9
                        </Button>
                        <Button
                          radius="md"
                          size="compact-xl"
                          fullWidth
                          p="xs"
                          fw="bold"
                          justify="center"
                          variant={setCardRank == "10" ? "filled" : "outline"}
                          onClick={() => {
                            setSetCardRank("10");
                          }}
                        >
                          {" "}
                          10
                        </Button>
                        <Button
                          radius="md"
                          size="compact-xl"
                          fullWidth
                          p="xs"
                          fw="bold"
                          justify="center"
                          variant={setCardRank == "J" ? "filled" : "outline"}
                          onClick={() => {
                            setSetCardRank("J");
                          }}
                        >
                          {" "}
                          J
                        </Button>
                        <Button
                          radius="md"
                          size="compact-xl"
                          fullWidth
                          p="xs"
                          fw="bold"
                          justify="center"
                          variant={setCardRank == "Q" ? "filled" : "outline"}
                          onClick={() => {
                            setSetCardRank("Q");
                          }}
                        >
                          {" "}
                          Q
                        </Button>
                        <Button
                          radius="md"
                          size="compact-xl"
                          fullWidth
                          p="xs"
                          fw="bold"
                          justify="center"
                          variant={setCardRank == "K" ? "filled" : "outline"}
                          onClick={() => {
                            setSetCardRank("K");
                          }}
                        >
                          {" "}
                          K
                        </Button>
                        <Button
                          radius="md"
                          size="compact-xl"
                          fullWidth
                          p="xs"
                          fw="bold"
                          justify="center"
                          variant={setCardRank == "A" ? "filled" : "outline"}
                          onClick={() => {
                            setSetCardRank("A");
                          }}
                        >
                          A
                        </Button>
                        <Button
                          radius="md"
                          size="compact-xl"
                          fullWidth
                          p="xs"
                          fw="bold"
                          justify="center"
                          variant={setCardRank == "NONE" ? "filled" : "outline"}
                          onClick={() => {
                            setSetCardRank("NONE");
                            setSetCardSuit("NONE");
                          }}
                        >
                          /
                        </Button>
                      </SimpleGrid>
                    </Group>
                    <Divider my="md" />
                    <Button fullWidth onClick={saveCard}>
                      Save
                    </Button>
                  </>
                </Modal>

                <Modal
                  opened={editModalOpened}
                  onClose={revertPlayer}
                  title="Edit Player"
                  centered
                  radius="md"
                >
                  <>
                    <TextInput
                      data-autofocus
                      label="Player Name"
                      value={editName}
                      onChange={(event) =>
                        setEditName(event.currentTarget.value)
                      }
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
                      value={editBalance}
                      onChange={(value) =>
                        setEditBalance(
                          isNaN(parseFloat(`${value}`))
                            ? 0
                            : parseFloat(`${value}`)
                        )
                      }
                    />
                    <Button fullWidth mt="md" onClick={savePlayer}>
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
                    fw={450}
                  >
                    Edit Player
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <IconBolt style={{ width: rem(20), height: rem(20) }} />
                    }
                    fw={450}
                  >
                    Force Turn
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <IconTrash style={{ width: rem(20), height: rem(20) }} />
                    }
                    color="red"
                    fw={450}
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
            <Text size={turn ? "md" : "sm"} c="dimmed">
              ${balance.toFixed(2)}
            </Text>
          </div>
          <Group justify="flex-end">
            {cards.map((card, i) => (
              <PlayingCard
                key={i}
                card={card}
                removeCard={removeCard}
                openSetCardModal={(card: Card) => {
                  setSelectedCardIndex(i);
                  setSetCardRank(card.rank);
                  setSetCardSuit(card.suit);
                  openSetCard();
                }}
              />
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
                  <Button fullWidth color="gray" onClick={cancelBet}>
                    Back
                  </Button>
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 2 }}>
                  <Button fullWidth color="green" onClick={placeBet}>
                    Bet
                  </Button>
                </Grid.Col>
              </Grid>
            </>
          ) : (
            <>
              <Button color="blue" disabled={!turn}>
                Check
              </Button>
              <Button color="red" disabled={!turn}>
                Fold
              </Button>
              <Button
                color="green"
                disabled={!turn}
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
