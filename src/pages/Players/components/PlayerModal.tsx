import { Player } from "@/types/Player";
import { parseMoney } from "@/utils/MoneyHelper";
import { Button, Modal, NumberInput, TextInput } from "@mantine/core";
import { getHotkeyHandler } from "@mantine/hooks";
import { IconCurrencyDollar, IconUserFilled } from "@tabler/icons-react";
import { useReducer, useState } from "react";

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
  onDelete?: () => void;
}) {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState(0);

  const [nameError, setNameError] = useState("");
  const [balanceError, setBalanceError] = useState("");

  const [reallyDelete, setReallyDelete] = useState(false);

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
    if (player) {
      player.name = name;
      player.balance = balance;
    } else {
      player = {
        id: crypto.randomUUID(),
        name,
        balance,
      };
    }

    onSave(player);
  };

  return (
    <Modal
      title={title}
      opened={opened}
      onClose={() => {
        onClose();
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
      {onDelete && (
        <Button
          fullWidth
          mt="md"
          color="red"
          onClick={() => {
            if (reallyDelete) {
              onDelete();
            } else {
              setReallyDelete(true);
            }
          }}
        >
          {reallyDelete ? "Are you sure?" : "Delete"}
        </Button>
      )}
      <Button fullWidth mt="md" onClick={savePlayer}>
        Save
      </Button>
    </Modal>
  );
}
