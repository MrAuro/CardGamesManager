import { PLAYERS_STATE, POKER_GAME_STATE, POKER_PLAYERS_STATE, POKER_SETTINGS_STATE } from "@/Root";
import { GameState, PokerPlayer } from "@/types/Poker";
import { formatMoney } from "@/utils/MoneyHelper";
import {
  ActionIcon,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  Divider,
  Flex,
  Input,
  InputWrapper,
  Modal,
  NumberInput,
  Select,
  Tabs,
  Text,
  TextInput,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import {
  IconArrowDown,
  IconArrowUp,
  IconCurrencyDollar,
  IconEdit,
  IconLock,
  IconLockOpen,
  IconPencil,
  IconSearch,
  IconTrash,
  IconTriangleSquareCircle,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { atom, useRecoilState, useRecoilValue } from "recoil";
import { emitPokerAction } from "../routes/Round";
import { useRecoilImmerState } from "@/utils/RecoilImmer";
import { UUID } from "crypto";

export const POT_EDITOR_OPEN = atom<boolean>({
  key: "POT_EDITOR_OPEN",
  default: false,
});

export default function PotEditorModal() {
  const [pokerGame, setPokerGame] = useRecoilState(POKER_GAME_STATE);
  const [modifiedPokerGame, setModifiedPokerGame] = useState(pokerGame);
  const [pokerPlayers, setPokerPlayers] = useRecoilImmerState(POKER_PLAYERS_STATE);
  const pokerSettings = useRecoilValue(POKER_SETTINGS_STATE);
  const [open, setOpen] = useRecoilState(POT_EDITOR_OPEN);
  const players = useRecoilValue(PLAYERS_STATE);

  const theme = useMantineTheme();

  const [selectedPlayer, setSelectedPlayer] = useState<UUID | null>();

  useEffect(() => {
    setModifiedPokerGame(pokerGame);
  }, [open]);

  return (
    <Modal
      opened={open}
      onClose={() => {
        setOpen(false);
      }}
      title="Editor"
      size="lg"
    >
      <Tabs defaultValue="pots">
        <Tabs.List>
          <Tabs.Tab value="pots">Pot Editor</Tabs.Tab>
          <Tabs.Tab value="winner">Winner Override</Tabs.Tab>
          <Tabs.Tab value="round">Round Editor</Tabs.Tab>
          <Tabs.Tab value="player">Player Editor</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="pots" pt="xs">
          <Flex direction="column" gap="md">
            {modifiedPokerGame.pots.map((pot, index) => {
              return (
                <Pot
                  index={index}
                  key={index}
                  pot={pot}
                  pokerPlayers={pokerPlayers}
                  savePot={(newPot) => {
                    setModifiedPokerGame({
                      ...modifiedPokerGame,
                      pots: modifiedPokerGame.pots.map((p, i) => (i === index ? newPot : p)),
                    });
                  }}
                  removePot={() => {
                    setModifiedPokerGame({
                      ...modifiedPokerGame,
                      pots: modifiedPokerGame.pots.filter((_, i) => i !== index),
                    });
                  }}
                />
              );
            })}
          </Flex>
          <Button
            fullWidth
            mt="xs"
            color="blue"
            onClick={() => {
              setModifiedPokerGame({
                ...modifiedPokerGame,
                pots: [
                  ...modifiedPokerGame.pots,
                  { amount: 0, closed: false, eligiblePlayers: [], winnerOverrides: [] },
                ],
              });
            }}
          >
            Add Side Pot
          </Button>
          <Button
            fullWidth
            mt="xs"
            color="green"
            onClick={() => {
              setPokerGame(modifiedPokerGame);
              setOpen(false);
            }}
          >
            Commit Changes
          </Button>
          <Text ta="center" size="xs" c="dimmed" mt="xs">
            Changes made here must be committed to take effect
          </Text>
        </Tabs.Panel>

        <Tabs.Panel value="winner" pt="xs">
          <Flex direction="column" gap="md">
            {modifiedPokerGame.pots.map((pot, index) => {
              return <WinnersPot index={index} key={index} pot={pot} pokerPlayers={pokerPlayers} />;
            })}
          </Flex>
          <Button
            fullWidth
            mt="xs"
            color="green"
            onClick={() => {
              emitPokerAction("distribute");
              setOpen(false);
            }}
            disabled={pokerGame.pots.some((pot) => pot?.winnerOverrides.length <= 0)}
          >
            Distribute and End
          </Button>
        </Tabs.Panel>

        <Tabs.Panel value="round" pt="xs">
          <Flex direction="column" gap="xs">
            <Select
              label="Game State"
              value={pokerGame.gameState}
              data={["PREFLOP", "FLOP", "TURN", "RIVER", "SHOWDOWN"]}
              allowDeselect={false}
              placeholder="Add Player"
              leftSectionPointerEvents="none"
              leftSection={<IconTriangleSquareCircle size="1.25rem" />}
              onChange={(value) => {
                if (!value) return;
                if (["PREFLOP", "FLOP", "TURN", "RIVER", "SHOWDOWN"].includes(value))
                  setPokerGame({
                    ...pokerGame,
                    gameState: value as GameState,
                  });
              }}
            />
            <NumberInput
              label="Current Bet"
              value={pokerGame.currentBet}
              allowNegative={false}
              thousandSeparator=","
              leftSection={<IconCurrencyDollar />}
              placeholder="0"
              decimalScale={2}
              fixedDecimalScale
              onChange={(value) => {
                setPokerGame({
                  ...pokerGame,
                  currentBet: parseFloat(`${value}`),
                });
              }}
            />

            <Divider />

            <Select
              label="Current Turn"
              description="You can click on a player to select them at any time"
              value={pokerGame.currentTurn}
              data={pokerPlayers.map((player) => ({
                value: player.id,
                label: player.displayName,
              }))}
              allowDeselect={false}
              placeholder="Select Player"
              leftSectionPointerEvents="none"
              leftSection={<IconSearch size="1.25rem" />}
              onChange={(value) => {
                if (!value) return;
                let player = pokerPlayers.find((p) => p.id === value);
                if (!player) return console.error("Player not found");

                setPokerGame({
                  ...pokerGame,
                  currentTurn: player.id,
                });
              }}
            />

            <Select
              label="Current Dealer"
              description="Modifying the dealer may adversely affect the game"
              value={pokerGame.currentDealer}
              data={pokerPlayers.map((player) => ({
                value: player.id,
                label: player.displayName,
              }))}
              allowDeselect={false}
              placeholder="Select Dealer"
              leftSectionPointerEvents="none"
              leftSection={<IconSearch size="1.25rem" />}
              onChange={(value) => {
                if (!value) return;
                let player = pokerPlayers.find((p) => p.id === value);
                if (!player) return console.error("Player not found");

                setPokerGame({
                  ...pokerGame,
                  currentDealer: player.id,
                });
              }}
            />

            {pokerSettings.forcedBetOption !== "ANTE" && (
              <>
                <Select
                  label="Small Blind"
                  value={pokerGame.currentSmallBlind}
                  data={pokerPlayers.map((player) => ({
                    value: player.id,
                    label: player.displayName,
                  }))}
                  allowDeselect={false}
                  placeholder="Select Small Blind"
                  leftSectionPointerEvents="none"
                  leftSection={<IconSearch size="1.25rem" />}
                  onChange={(value) => {
                    if (!value) return;
                    let player = pokerPlayers.find((p) => p.id === value);
                    if (!player) return console.error("Player not found");

                    setPokerGame({
                      ...pokerGame,
                      currentSmallBlind: player.id,
                    });
                  }}
                />

                <Select
                  label="Big Blind"
                  value={pokerGame.currentBigBlind}
                  data={pokerPlayers.map((player) => ({
                    value: player.id,
                    label: player.displayName,
                  }))}
                  allowDeselect={false}
                  placeholder="Select Big Blind"
                  leftSectionPointerEvents="none"
                  leftSection={<IconSearch size="1.25rem" />}
                  onChange={(value) => {
                    if (!value) return;
                    let player = pokerPlayers.find((p) => p.id === value);
                    if (!player) return console.error("Player not found");

                    setPokerGame({
                      ...pokerGame,
                      currentBigBlind: player.id,
                    });
                  }}
                />
              </>
            )}
          </Flex>
        </Tabs.Panel>

        <Tabs.Panel value="player" pt="xs">
          <Flex direction="column" gap="sm">
            <Select
              label="Selected Player"
              value={selectedPlayer}
              data={pokerPlayers.map((player) => ({
                value: player.id,
                label: player.displayName,
              }))}
              allowDeselect={false}
              placeholder="Select Player"
              leftSectionPointerEvents="none"
              leftSection={<IconSearch size="1.25rem" />}
              onChange={(value) => {
                setSelectedPlayer(value as UUID | null);
              }}
            />
            {selectedPlayer ? (
              <>
                <Card
                  p="sm"
                  withBorder
                  style={{
                    backgroundColor: theme.colors.dark[8],
                  }}
                >
                  <Flex direction="column" gap="sm">
                    <Text size="xs" c="dimmed">
                      Player ID: {selectedPlayer}
                    </Text>
                    <TextInput
                      label="Display Name"
                      placeholder="Player Name"
                      description="This name only affects the active Poker game"
                      leftSection={<IconPencil size="1.25rem" />}
                      value={pokerPlayers.find((p) => p.id === selectedPlayer)?.displayName}
                      onChange={(event) => {
                        setPokerPlayers((players) => {
                          let player = players.find((p) => p.id === selectedPlayer);
                          if (!player) return players;

                          player.displayName = event.currentTarget.value;
                        });
                      }}
                    />
                    <Input.Wrapper
                      label="Player Flags"
                      description="These flags pot calculations so you will need to manually adjust them"
                    >
                      <Checkbox
                        ml="md"
                        mt={5}
                        size="md"
                        label="Folded"
                        style={{
                          userSelect: "none",
                          cursor: "pointer",
                        }}
                        checked={pokerPlayers.find((p) => p.id === selectedPlayer)?.folded}
                        onChange={(event) => {
                          setPokerPlayers((players) => {
                            let player = players.find((p) => p.id === selectedPlayer);
                            if (!player) return players;

                            player.folded = event.currentTarget.checked;
                          });
                        }}
                      />
                      <Checkbox
                        ml="md"
                        mt={5}
                        size="md"
                        label="All In"
                        style={{
                          userSelect: "none",
                          cursor: "pointer",
                        }}
                        checked={pokerPlayers.find((p) => p.id === selectedPlayer)?.allIn}
                        onChange={(event) => {
                          setPokerPlayers((players) => {
                            let player = players.find((p) => p.id === selectedPlayer);
                            if (!player) return players;

                            player.allIn = event.currentTarget.checked;
                          });
                        }}
                      />
                      <Checkbox
                        ml="md"
                        mt={5}
                        size="md"
                        label="Been On"
                        style={{
                          userSelect: "none",
                          cursor: "pointer",
                        }}
                        checked={pokerPlayers.find((p) => p.id === selectedPlayer)?.beenOn}
                        onChange={(event) => {
                          setPokerPlayers((players) => {
                            let player = players.find((p) => p.id === selectedPlayer);
                            if (!player) return players;

                            player.beenOn = event.currentTarget.checked;
                          });
                        }}
                      />
                    </Input.Wrapper>
                    <NumberInput
                      label="Current Bet"
                      value={pokerPlayers.find((p) => p.id === selectedPlayer)?.currentBet}
                      allowNegative={false}
                      thousandSeparator=","
                      leftSection={<IconCurrencyDollar />}
                      placeholder="0"
                      decimalScale={2}
                      fixedDecimalScale
                      max={players.find((p) => p.id === selectedPlayer)?.balance}
                      onChange={(value) => {
                        setPokerPlayers((players) => {
                          let player = players.find((p) => p.id === selectedPlayer);
                          if (!player) return players;

                          player.currentBet = parseFloat(`${value}`);
                        });
                      }}
                    />
                    <Input.Wrapper label="Player Actions">
                      <Flex direction="row" gap="xs" mt={5}>
                        <Button
                          leftSection={<IconArrowUp />}
                          fullWidth
                          color="blue"
                          variant="light"
                          disabled={pokerPlayers.findIndex((p) => p.id === selectedPlayer) === 0}
                          onClick={() => {
                            setPokerPlayers((players) => {
                              let player = players.find((p) => p.id === selectedPlayer);
                              if (!player) return players;

                              let index = players.findIndex((p) => p.id === selectedPlayer);
                              if (index === 0) return players;

                              players[index] = players[index - 1];
                              players[index - 1] = player;
                            });
                          }}
                        >
                          Move Up
                        </Button>
                        <Button
                          leftSection={<IconArrowDown />}
                          fullWidth
                          color="blue"
                          variant="light"
                          disabled={
                            pokerPlayers.findIndex((p) => p.id === selectedPlayer) ===
                            pokerPlayers.length - 1
                          }
                          onClick={() => {
                            setPokerPlayers((players) => {
                              let player = players.find((p) => p.id === selectedPlayer);
                              if (!player) return players;

                              let index = players.findIndex((p) => p.id === selectedPlayer);
                              if (index === players.length - 1) return players;

                              players[index] = players[index + 1];
                              players[index + 1] = player;
                            });
                          }}
                        >
                          Move Down
                        </Button>
                        <Button
                          leftSection={<IconTrash />}
                          fullWidth
                          color="red"
                          variant="light"
                          onClick={() => {
                            setPokerPlayers((players) => {
                              let player = players.find((p) => p.id === selectedPlayer);
                              if (!player) return players;

                              return players.filter((p) => p.id !== selectedPlayer);
                            });

                            setPokerGame((game) => {
                              return {
                                ...game,
                                currentDealer:
                                  game.currentDealer === selectedPlayer
                                    ? pokerPlayers[0].id
                                    : game.currentDealer,
                                pots: game.pots.map((pot) => {
                                  return {
                                    ...pot,
                                    eligiblePlayers: pot.eligiblePlayers.filter(
                                      (p) => p !== selectedPlayer
                                    ),
                                    winnerOverrides: (pot.winnerOverrides || []).filter(
                                      (w) => w !== selectedPlayer
                                    ),
                                  };
                                }),
                              };
                            });

                            setSelectedPlayer(null);
                          }}
                        >
                          Remove
                        </Button>
                      </Flex>
                    </Input.Wrapper>
                  </Flex>
                </Card>
              </>
            ) : (
              <>
                <Text size="sm" c="dimmed" ta="center">
                  Select a player to edit
                </Text>
              </>
            )}
          </Flex>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}

function Pot({
  pot,
  pokerPlayers,
  index,
  savePot,
  removePot,
}: {
  pot: {
    amount: number;
    closed: boolean;
    eligiblePlayers: string[];
  };
  pokerPlayers: any[];
  index: number;
  savePot: (pot: any) => void;
  removePot: () => void;
}) {
  const theme = useMantineTheme();

  const [modifiedPot, setModifiedPot] = useState(pot);

  // Immediately clears the selection
  // https://discord.com/channels/854810300876062770/1202574436516237323/1202575107290304522 (Mantine Discord)
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>();
  useEffect(() => {
    setSelectedPlayer(null);
  }, [selectedPlayer]);

  return (
    <Card
      p="sm"
      withBorder
      style={{
        backgroundColor: theme.colors.dark[8],
      }}
      key={index}
    >
      <Text fw="bold" size="lg">
        {index == 0 ? "Main Pot" : `Side Pot #${index}`}
        {modifiedPot === pot ? "" : " (modified)"}
      </Text>
      <Divider my={2} />
      <NumberInput
        label="Amount"
        radius="md"
        allowNegative={false}
        thousandSeparator=","
        leftSection={<IconCurrencyDollar />}
        placeholder="0"
        value={modifiedPot.amount}
        decimalScale={2}
        fixedDecimalScale
        onChange={(value) => {
          setModifiedPot({
            ...modifiedPot,
            amount: parseFloat(`${value}`),
          });
        }}
      />
      <Divider mt={10} mb={5} />
      <InputWrapper label="Eligible Players">
        <Select
          placeholder="Add Player"
          leftSectionPointerEvents="none"
          leftSection={<IconSearch size="1.25rem" />}
          clearable
          radius="md"
          variant="unstyled"
          value={selectedPlayer}
          data={pokerPlayers
            .filter((player) => !modifiedPot.eligiblePlayers.includes(player.id))
            .map((player) => ({
              value: player.id,
              label: `${player.displayName} (${formatMoney(player.currentBet)})`,
            }))}
          onChange={(_value, option) => {
            setSelectedPlayer(option.value);
            let player = pokerPlayers.find((p) => p.id === option.value);
            if (!player) return console.error("Player not found");

            setModifiedPot({
              ...modifiedPot,
              eligiblePlayers: [...modifiedPot.eligiblePlayers, player.id],
            });
          }}
        />
        {modifiedPot.eligiblePlayers.map((id, i) => {
          let player = pokerPlayers.find((p) => p.id === id) as PokerPlayer | undefined;
          if (!player) return null;

          return (
            <Flex gap={3} align="center" mt={i == 0 ? undefined : "xs"} key={id}>
              <ActionIcon
                size="sm"
                variant="transparent"
                color="red"
                onClick={() => {
                  setModifiedPot({
                    ...modifiedPot,
                    eligiblePlayers: modifiedPot.eligiblePlayers.filter((p) => p !== id),
                  });
                }}
              >
                <IconX />
              </ActionIcon>
              <Text size="md" fw={500}>
                {player.displayName}
              </Text>
            </Flex>
          );
        })}
      </InputWrapper>
      <Divider mt={10} mb={5} />
      <Input.Wrapper
        label="Pot Closed"
        description="A closed pot will not be able to receive any more bets"
        mt={0}
        mb="xs"
      >
        <ButtonGroup mt={5}>
          <Button
            variant={modifiedPot.closed ? "filled" : "default"}
            leftSection={<IconLock />}
            onClick={() => {
              setModifiedPot({ ...modifiedPot, closed: true });
            }}
          >
            Closed
          </Button>
          <Button
            variant={!modifiedPot.closed ? "filled" : "default"}
            leftSection={<IconLockOpen />}
            onClick={() => {
              setModifiedPot({ ...modifiedPot, closed: false });
            }}
          >
            Open
          </Button>
        </ButtonGroup>
      </Input.Wrapper>
      <Flex direction="row" gap="xs">
        <Button
          fullWidth
          color="green"
          onClick={() => savePot(modifiedPot)}
          disabled={modifiedPot === pot}
        >
          Save
        </Button>
        <Tooltip
          label={index == 0 ? "Cannot remove main pot" : undefined}
          style={{
            visibility: index == 0 ? "visible" : "hidden",
          }}
        >
          <Button fullWidth color="red" disabled={index == 0} onClick={removePot}>
            Remove
          </Button>
        </Tooltip>
      </Flex>
    </Card>
  );
}

function WinnersPot({
  pot,
  pokerPlayers,
  index,
}: {
  pot: {
    amount: number;
    closed: boolean;
    eligiblePlayers: string[];
  };
  pokerPlayers: any[];
  index: number;
}) {
  const theme = useMantineTheme();
  const [pokerGame, setPokerGame] = useRecoilState(POKER_GAME_STATE);

  return (
    <Card
      p="sm"
      withBorder
      style={{
        backgroundColor: theme.colors.dark[8],
      }}
      key={index}
    >
      <Text fw="bold" size="lg">
        {index == 0 ? "Main Pot" : `Side Pot #${index}`} ({formatMoney(pot.amount)})
      </Text>
      <Divider my={2} />
      <InputWrapper label="Winners" description="Multiple checked winners will split the pot">
        {pot.eligiblePlayers.map((id) => {
          let player = pokerPlayers.find((p) => p.id === id) as PokerPlayer | undefined;
          if (!player) return null;

          return (
            <Flex gap={3} align="center" mt="xs" key={id}>
              <Checkbox
                size="md"
                label={player.displayName}
                checked={pokerGame.pots[index]?.winnerOverrides?.includes(id)}
                onChange={(event) => {
                  let checked = event.currentTarget.checked;
                  setPokerGame({
                    ...pokerGame,
                    pots: pokerGame.pots.map((p, i) => {
                      if (i !== index) return p;
                      return {
                        ...p,
                        winnerOverrides: checked
                          ? [...(p.winnerOverrides || []), id]
                          : (p.winnerOverrides || []).filter((w) => w !== id),
                      };
                    }),
                  });
                }}
                style={{
                  userSelect: "none",
                  cursor: "pointer",
                }}
              />
            </Flex>
          );
        })}
      </InputWrapper>
      <Text size="sm" c="dimmed" mt="xs">
        Splitting{" "}
        <span
          style={{
            fontWeight: "bold",
          }}
        >
          {pokerGame.pots[index]?.winnerOverrides?.length || 0}
        </span>{" "}
        way
        {pokerGame.pots[index]?.winnerOverrides?.length == 1 ? "" : "s"}:{" "}
        <span
          style={{
            fontWeight: "bold",
          }}
        >
          {formatMoney(pot.amount / (pokerGame.pots[index]?.winnerOverrides?.length || 1))}
        </span>
      </Text>
    </Card>
  );
}
