import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Divider,
  Grid,
  Group,
  Menu,
  Modal,
  NumberInput,
  Paper,
  Stack,
  Text,
  TextInput,
  rem,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { getHotkeyHandler, useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
  IconBolt,
  IconCards,
  IconChevronDown,
  IconCurrencyDollar,
  IconPencil,
  IconTrash,
  IconUserFilled,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { PLAYER_HANDS, STATE, State } from "../App";
import { Card, Player, suitToEmoji } from "../utils/Game";
import ImprovedCardPicker from "./ImprovedCardPicker";
import PlayingCard from "./PlayingCard";
import PositionBadge from "./PosititionBadge";

export default function ImprovedPlayerCard(props: {
  player: Player;
  handler: any;
}) {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const [state, setState] = useRecoilState<State>(STATE);
  const playerHands = useRecoilValue(PLAYER_HANDS);

  const [, dropdownMenuHandlers] = useDisclosure(false);
  const [editPlayerModalOpened, editPlayerModalHandlers] = useDisclosure(false);
  const [cardPickerOpened, cardPickerOpenedHandlers] = useDisclosure(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(0);

  const [isCapturingBet, setIsCapturingBet] = useState(false);

  const [TEMP_name, setTEMP_name] = useState(props.player.name);
  const [TEMP_balance, setTEMP_balance] = useState(props.player.balance);
  const [TEMP_bet, setTEMP_bet] = useState(0);

  const openDeletePlayerModal = () => {
    modals.openConfirmModal({
      title: "Delete Player",
      children: "Are you sure that you want to delete this player?",
      labels: { confirm: `Delete "${props.player.name}"`, cancel: "Cancel" },
      confirmProps: { color: "red" },
      cancelProps: { color: "gray" },
      groupProps: { grow: true },
      onConfirm: () => {
        const _players = state.players.filter(
          (player) => player.id !== props.player.id
        );
        props.handler.remove(props.player.id);
        setState({ ...state, players: _players });
        notifications.show({
          message: "Player Deleted",
          color: "red",
        });
      },
    });
  };

  const openHandRankingModal = () => {
    const hand = playerHands[state.players.indexOf(props.player)];

    modals.open({
      title: `${
        state.players[state.players.indexOf(props.player)].name
      }'s Hand`,
      children: (
        <>
          <Text>
            <b>Combination:</b> {hand.combination}
          </Text>
          <Text>
            <b>Made Hand:</b> {suitToEmoji(hand.madeHand.join(" "))}
          </Text>
          <Text>
            <b>Unused Cards:</b> {suitToEmoji(hand.unused.join(" "))}
          </Text>
          <Text>
            <b>Rank:</b> #{hand.rank}
          </Text>
        </>
      ),
    });
  };

  const [turn, setTurn] = useState(false);
  useEffect(() => {
    setTurn(state.currentPlayerIndex == state.players.indexOf(props.player));
  }, [state]);

  const placeBet = () => {
    console.log("Placing bet");
    setIsCapturingBet(false);
  };

  const cancelBet = () => {
    console.log("Cancelling bet");
    setTEMP_bet(0);
    setIsCapturingBet(false);
  };

  const stopEditingPlayer = () => {
    editPlayerModalHandlers.close();
    setTEMP_name(props.player.name);
    setTEMP_balance(props.player.balance);
  };

  const saveEditedPlayer = () => {
    console.log("Saving player");
    editPlayerModalHandlers.close();
    const _players = [...state.players];
    _players[_players.indexOf(props.player)] = {
      ...props.player,
      name: TEMP_name,
      balance: TEMP_balance,
    };
    setState({ ...state, players: _players });

    notifications.show({
      message: "Player Saved",
      color: "green",
    });
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
        <Group justify="space-between">
          <div>
            <Text
              size={turn ? "xl" : "lg"}
              fw={turn ? 700 : 500}
              tt="capitalize"
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                {props.player.name}
                {
                  <PositionBadge
                    player={props.player}
                    nextDealer={() => {
                      console.log("NEXT DEALER");
                    }}
                  />
                }

                <Menu position="bottom-start">
                  <Menu.Target>
                    <ActionIcon
                      variant="transparent"
                      color={theme.colors.dark[1]}
                      onClick={() => dropdownMenuHandlers.toggle()}
                    >
                      <IconChevronDown
                        style={{ width: rem(22), height: rem(22) }}
                      />
                    </ActionIcon>
                  </Menu.Target>

                  <ImprovedCardPicker
                    opened={cardPickerOpened}
                    handleClose={(card: Card) => {
                      cardPickerOpenedHandlers.close();

                      const playerCards = [
                        ...state.players[state.players.indexOf(props.player)]
                          .cards,
                      ];
                      playerCards[selectedCardIndex] = card;

                      const _players = [...state.players];
                      _players[_players.indexOf(props.player)] = {
                        ...props.player,
                        cards: [playerCards[0], playerCards[1]],
                      };

                      setState({
                        ...state,
                        players: _players,
                      });
                    }}
                  />

                  <Modal
                    opened={editPlayerModalOpened}
                    onClose={stopEditingPlayer}
                    title="Edit Player"
                    centered
                    radius="md"
                  >
                    <>
                      <TextInput
                        data-autofocus
                        label="Player Name"
                        value={TEMP_name}
                        onChange={(event) =>
                          setTEMP_name(event.currentTarget.value)
                        }
                        onKeyDown={getHotkeyHandler([
                          ["enter", saveEditedPlayer],
                        ])}
                        radius="md"
                        leftSection={<IconUserFilled />}
                      />
                      <NumberInput
                        label="Player Balance"
                        allowNegative={false}
                        decimalScale={2}
                        onKeyDown={getHotkeyHandler([
                          ["enter", saveEditedPlayer],
                        ])}
                        fixedDecimalScale
                        thousandSeparator=","
                        mt="md"
                        radius="md"
                        leftSection={<IconCurrencyDollar />}
                        value={TEMP_balance}
                        onChange={(value) =>
                          setTEMP_balance(
                            isNaN(parseFloat(`${value}`))
                              ? 0
                              : parseFloat(`${value}`)
                          )
                        }
                      />
                      <Button fullWidth mt="md" onClick={saveEditedPlayer}>
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
                        <IconPencil
                          style={{ width: rem(20), height: rem(20) }}
                        />
                      }
                      onClick={editPlayerModalHandlers.open}
                      fw={450}
                    >
                      Edit Player
                    </Menu.Item>
                    <Menu.Item
                      leftSection={
                        <IconBolt style={{ width: rem(20), height: rem(20) }} />
                      }
                      fw={450}
                      onClick={() => {
                        setState({
                          ...state,
                          currentPlayerIndex: state.players.indexOf(
                            props.player
                          ),
                        });
                      }}
                    >
                      Force Turn
                    </Menu.Item>
                    <Menu.Item
                      leftSection={
                        <IconCards
                          style={{ width: rem(20), height: rem(20) }}
                        />
                      }
                      fw={450}
                      onClick={() => {
                        setState({
                          ...state,
                          dealerIndex: state.players.indexOf(props.player),
                        });
                      }}
                    >
                      Make Dealer
                    </Menu.Item>
                    <Menu.Item
                      leftSection={
                        <IconTrash
                          style={{ width: rem(20), height: rem(20) }}
                        />
                      }
                      color="red"
                      fw={450}
                      onClick={openDeletePlayerModal}
                    >
                      Delete Player
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </div>
            </Text>
            <Text size={turn ? "md" : "sm"} c="dimmed">
              ${props.player.balance.toFixed(2)}
            </Text>
          </div>
          <Group justify="flex-end">
            <Paper
              style={{
                width: "5rem",
                height: "4.5rem",
                backgroundColor: "transparent",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <Stack gap={0} align="center">
                  {playerHands.length > 0 &&
                    (state.players.indexOf(props.player) ==
                    playerHands.indexOf(
                      playerHands.reduce((a, b) => {
                        if (a.rank < b.rank) {
                          return a;
                        } else {
                          return b;
                        }
                      })
                    ) ? (
                      <Badge mb="0.25rem" color="#22dd22" variant="light">
                        Winner
                      </Badge>
                    ) : null)}
                  <Text
                    ta="center"
                    fw="bold"
                    size="lg"
                    style={{ cursor: "pointer" }}
                    onClick={openHandRankingModal}
                  >
                    {playerHands[
                      state.players.indexOf(props.player)
                    ]?.combination
                      .split(/(?=[A-Z])/)
                      .join(" ")
                      .replace("Of", "of")
                      .replace(" A ", " a ")
                      .replace("Four of a Kind", "Quads")}
                  </Text>
                </Stack>
              </div>
            </Paper>
            {state.players[state.players.indexOf(props.player)]?.cards.map(
              (card, i) => (
                <PlayingCard
                  key={i}
                  card={card}
                  onClick={() => {
                    setSelectedCardIndex(i);
                    cardPickerOpenedHandlers.open();
                  }}
                />
              )
            )}
          </Group>
        </Group>
        <Divider my="xs" />
        <Group grow gap="xs" justify="center">
          {isCapturingBet ? (
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
                    value={TEMP_bet}
                    onChange={(value) => setTEMP_bet(parseFloat(`${value}`))}
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
                  setIsCapturingBet(true);
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
