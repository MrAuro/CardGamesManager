import { Button, Modal, NumberInput, TextInput } from "@mantine/core";
import { useRecoilState } from "recoil";
import { STATE, State } from "../App";
import { IconCurrencyDollar, IconUserFilled, IconUserPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { getHotkeyHandler } from "@mantine/hooks";
import { Player } from "../types/Player";
import PlayerListItem from "../components/PlayerListItem";
import { useCustomRecoilState } from "../utils/RecoilHelper";

export default function Players() {
  const [state, setState, modifyState] = useCustomRecoilState<State>(STATE);

  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [isEditingPlayer, setIsEditingPlayer] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const addPlayer = () => {
    setIsAddingPlayer(true);
  };

  const editPlayer = (player: Player) => {
    setIsEditingPlayer(true);
    setEditingPlayer(player);
  };

  return (
    <>
      <AddPlayerModal opened={isAddingPlayer} setOpened={setIsAddingPlayer} />
      {editingPlayer && (
        <EditPlayerModal
          opened={isEditingPlayer}
          setOpened={setIsEditingPlayer}
          playerId={editingPlayer.id}
        />
      )}
      {state.players.map((player) => (
        <PlayerListItem key={player.id} player={player} editPlayer={editPlayer} my="xs" />
      ))}
      <Button
        fullWidth
        disabled={state.currentGamePlaying != "NONE"}
        onClick={addPlayer}
        leftSection={<IconUserPlus />}
      >
        Add Player
      </Button>
    </>
  );
}

const AddPlayerModal = (props: { opened: boolean; setOpened: (value: boolean) => void }) => {
  const [state, setState] = useRecoilState<State>(STATE);

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");

  const [balance, setBalance] = useState(10);
  const [balanceError, setBalanceError] = useState("");

  const savePlayer = () => {
    let errors = false;
    if (name.trim().length == 0) {
      setNameError("Name is required");
      errors = true;
    }

    if (name.trim().length > 20) {
      setNameError("Name is too long");
      errors = true;
    }

    if (state.players.find((p) => p.name == name)) {
      setNameError("Name is already taken");
      errors = true;
    }

    if (balance <= 0 || isNaN(balance)) {
      setBalanceError("Balance is invalid");
      errors = true;
    }

    if (errors) return;

    setNameError("");
    setBalanceError("");

    let newPlayer: Player = {
      name: name,
      balance: balance,
      id: crypto.randomUUID(),
    };

    setState({
      ...state,
      players: [...state.players, newPlayer],
    });

    props.setOpened(false);
  };

  return (
    <Modal
      opened={props.opened}
      onClose={() => {
        props.setOpened(false);
        setName("");
        setBalance(10);
        setNameError("");
        setBalanceError("");
      }}
      title="Add Player"
      centered
      radius="md"
    >
      <TextInput
        data-autofocus
        label="Player Name"
        maxLength={20}
        value={name}
        error={nameError}
        onChange={(event) => setName(event.currentTarget.value)}
        onKeyDown={getHotkeyHandler([["enter", savePlayer]])}
        radius="md"
        leftSection={<IconUserFilled />}
      />
      <NumberInput
        label="Player Balance"
        allowNegative={false}
        decimalScale={2}
        error={balanceError}
        onKeyDown={getHotkeyHandler([["enter", savePlayer]])}
        fixedDecimalScale
        thousandSeparator=","
        mt="md"
        radius="md"
        leftSection={<IconCurrencyDollar />}
        value={balance}
        onChange={(value) => setBalance(parseFloat(`${value}`))}
      />
      <Button fullWidth mt="md" onClick={savePlayer}>
        Save
      </Button>
    </Modal>
  );
};

const EditPlayerModal = (props: {
  playerId: string;
  opened: boolean;
  setOpened: (value: boolean) => void;
}) => {
  const [state, setState, modifyState] = useCustomRecoilState<State>(STATE);

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");

  const [balance, setBalance] = useState(0);
  const [balanceError, setBalanceError] = useState("");

  const [reallyDelete, setReallyDelete] = useState(false);

  useEffect(() => {
    let player = state.players.find((p) => p.id == props.playerId);
    if (player) {
      setName(player.name);
      setBalance(player.balance);
    }
  }, [props.playerId]);

  const editPlayer = () => {
    let existingPlayerNames = state.players
      .filter((p) => p.id != props.playerId)
      .map((p) => p.name);

    let errors = false;
    if (name.trim().length == 0) {
      setNameError("Name is required");
      errors = true;
    }

    if (name.trim().length > 20) {
      setNameError("Name is too long");
      errors = true;
    }

    if (existingPlayerNames.includes(name)) {
      setNameError("Name is already taken");
      errors = true;
    }

    if (balance <= 0 || isNaN(balance)) {
      setBalanceError("Balance is invalid");
      errors = true;
    }

    if (errors) return;

    setNameError("");
    setBalanceError("");

    let newPlayer: Player = {
      name: name,
      balance: balance,
      id: crypto.randomUUID(),
    };

    modifyState({
      players: state.players.map((p) => {
        if (p.id == props.playerId) {
          return newPlayer;
        }
        return p;
      }),
    });

    props.setOpened(false);
  };

  const deletePlayer = () => {
    if (reallyDelete) {
      setState({
        ...state,
        players: state.players.filter((p) => p.id != props.playerId),
        blackjack: {
          ...state.blackjack,
          players: state.blackjack.players.filter((p) => p.id != props.playerId),
        },
      });
      props.setOpened(false);
      setReallyDelete(false);
    } else {
      setReallyDelete(true);
    }
  };

  return (
    <Modal
      opened={props.opened}
      onClose={() => {
        props.setOpened(false);
        setNameError("");
        setBalanceError("");
      }}
      title={`Edit Player`}
      centered
      radius="md"
    >
      <TextInput
        data-autofocus
        label="Player Name"
        maxLength={20}
        value={name}
        error={nameError}
        onChange={(event) => setName(event.currentTarget.value)}
        onKeyDown={getHotkeyHandler([["enter", editPlayer]])}
        radius="md"
        leftSection={<IconUserFilled />}
      />
      <NumberInput
        label="Player Balance"
        allowNegative={false}
        decimalScale={2}
        error={balanceError}
        onKeyDown={getHotkeyHandler([["enter", editPlayer]])}
        fixedDecimalScale
        thousandSeparator=","
        mt="md"
        radius="md"
        leftSection={<IconCurrencyDollar />}
        value={balance}
        onChange={(value) => setBalance(parseFloat(`${value}`))}
      />
      <Button fullWidth mt="md" onClick={deletePlayer} color="red">
        {reallyDelete ? "Are you sure?" : "Delete"}
      </Button>
      <Button fullWidth mt="xs" onClick={editPlayer}>
        Save
      </Button>
    </Modal>
  );
};
