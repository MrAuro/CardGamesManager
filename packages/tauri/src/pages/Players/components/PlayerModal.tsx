import { Player } from "@/types/Player";
import { parseMoney } from "@/utils/MoneyHelper";
import { Button, Modal, NumberInput, TextInput } from "@mantine/core";
import { getHotkeyHandler } from "@mantine/hooks";
import { IconCurrencyDollar, IconUserFilled } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export default function PlayerModal({
  opened,
  title,
  player,
  onSave,
  onClose,
  onDelete,
}: {
  opened: boolean;
  title: string;
  player: Player | null;
  onSave: (player: Player) => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState(100);

  const [nameError, setNameError] = useState("");
  const [balanceError, setBalanceError] = useState("");

  const [reallyDelete, setReallyDelete] = useState(false);

  useEffect(() => {
    if (player) {
      setName(player.name);
      setBalance(player.balance);
    }
  }, [player]);

  const savePlayer = () => {
    let errors = false;

    if (!name || name.trim().length === 0) {
      setNameError("Name is required");
      errors = true;
    }

    if (balance < 0 || isNaN(balance)) {
      setBalanceError("Balance cannot be negative");
      errors = true;
    }

    // If there are errors, return - the reason for this is that we want to show all errors at once
    if (errors) return;

    setNameError("");
    setBalanceError("");

    // If we have a player, we are editing, otherwise we are creating a new player
    let newPlayer: Player;
    if (player) {
      newPlayer = { ...player, name, balance };
    } else {
      newPlayer = {
        id: crypto.randomUUID(),
        name,
        balance,
      };
    }

    onSave(newPlayer);
    resetState();
  };

  const resetState = () => {
    setName("");
    setBalance(100);
    setNameError("");
    setBalanceError("");
    setReallyDelete(false);
  };

  return (
    <Modal
      title={title}
      opened={opened}
      onClose={() => {
        onClose();
        resetState();
      }}
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
        onChange={(value) => setBalance(parseMoney(value))}
      />
      {player && (
        <Button
          fullWidth
          mt="sm"
          color="red"
          onClick={() => {
            if (reallyDelete) {
              onDelete();
              resetState();
            } else {
              setReallyDelete(true);
            }
          }}
        >
          {reallyDelete ? "Are you sure?" : "Delete"}
        </Button>
      )}
      <Button fullWidth mt="xs" onClick={savePlayer}>
        Save
      </Button>
    </Modal>
  );
}
