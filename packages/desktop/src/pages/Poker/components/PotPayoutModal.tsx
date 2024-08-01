import PlayerSelector from "@/components/PlayerSelector";
import { POKER_GAME_STATE, POKER_PLAYERS_STATE } from "@/Root";
import { PokerPlayer } from "@/types/Poker";
import { formatMoney } from "@/utils/MoneyHelper";
import { useRecoilImmerState } from "@/utils/RecoilImmer";
import {
  ActionIcon,
  Button,
  ButtonGroup,
  Card,
  Container,
  darken,
  Divider,
  Flex,
  Group,
  Input,
  InputWrapper,
  Modal,
  NumberInput,
  Select,
  Text,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { IconCurrencyDollar, IconLock, IconLockOpen, IconSearch, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { atom, useRecoilState } from "recoil";

export const POT_EDITOR_OPEN = atom<boolean>({
  key: "POT_EDITOR_OPEN",
  default: false,
});

export default function PotEditorModal() {
  const [pokerGame, setPokerGame] = useRecoilState(POKER_GAME_STATE);
  const [modifiedPokerGame, setModifiedPokerGame] = useState(pokerGame);
  const [pokerPlayers, setPokerPlayers] = useRecoilImmerState(POKER_PLAYERS_STATE);
  const [open, setOpen] = useRecoilState(POT_EDITOR_OPEN);

  return (
    <Modal
      opened={open}
      onClose={() => {
        setOpen(false);
      }}
      title="Pot Payout"
      size="md"
    >
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
            pots: [...modifiedPokerGame.pots, { amount: 0, closed: false, eligiblePlayers: [] }],
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
            <Flex gap={3} align="center" mt={i == 0 ? undefined : "xs"}>
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
