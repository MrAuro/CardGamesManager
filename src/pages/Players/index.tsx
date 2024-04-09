import {
  BLACKJACK_GAME_STATE,
  BLACKJACK_PLAYERS_STATE,
  PLAYERS_STATE,
  POKER_GAME_STATE,
  POKER_PLAYERS_STATE,
} from "@/Root";
import GenericPlayerCard from "@/components/GenericPlayerCard";
import { useRecoilImmerState } from "@/utils/RecoilImmer";
import { ActionIcon, Button, Flex } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import PlayerModal from "./components/PlayerModal";
import { formatMoney } from "@/utils/MoneyHelper";

export default function Players() {
  const [players, setPlayers] = useRecoilImmerState(PLAYERS_STATE);

  const [playerModalOpened, setPlayerModalOpened] = useState(false);
  const [playerIdToEdit, setPlayerIdToEdit] = useState<string | null>(null);
  const [playerModalTitle, setPlayerModalTitle] = useState("Add Player");

  const [blackjackPlayers] = useRecoilState(BLACKJACK_PLAYERS_STATE);
  const [pokerPlayers] = useRecoilState(POKER_PLAYERS_STATE);
  const pokerGame = useRecoilValue(POKER_GAME_STATE);
  const blackjackGame = useRecoilValue(BLACKJACK_GAME_STATE);

  const [removeAllConfirm, setRemoveAllConfirm] = useState(false);

  return (
    <>
      <PlayerModal
        opened={playerModalOpened}
        title={playerModalTitle}
        player={playerIdToEdit ? players.find((p) => p.id === playerIdToEdit) || null : null}
        onSave={(player) => {
          setPlayerModalOpened(false);
          setPlayers((draft) => {
            const index = draft.findIndex((p) => p.id === player.id);
            if (index === -1) {
              draft.push(player);
            } else {
              draft[index] = player;
            }
          });
          setPlayerIdToEdit(null);
        }}
        onClose={() => {
          setPlayerModalOpened(false);
        }}
        onDelete={() => {
          setPlayerModalOpened(false);
          if (
            playerIdToEdit &&
            blackjackPlayers.every((p) => p.id !== playerIdToEdit) &&
            pokerPlayers.every((p) => p.id !== playerIdToEdit)
          )
            setPlayers((draft) => {
              const index = draft.findIndex((p) => p.id === playerIdToEdit);
              draft.splice(index, 1);
            });
          else alert("Cannot delete player that is in a game");
        }}
      />
      <Flex direction="column" gap="xs">
        {players.map((player) => (
          <GenericPlayerCard
            header={player.name}
            subtext={formatMoney(player.balance)}
            key={player.id}
            rightSection={
              <ActionIcon
                variant="transparent"
                color="dark.0"
                size="xl"
                radius="md"
                onClick={() => {
                  setPlayerIdToEdit(player.id);
                  setPlayerModalTitle("Edit Player");
                  setPlayerModalOpened(true);
                }}
              >
                <IconPencil />
              </ActionIcon>
            }
          />
        ))}
      </Flex>
      <Button
        fullWidth
        my="sm"
        onClick={() => {
          setPlayerIdToEdit(null);
          setPlayerModalTitle("Add Player");
          setPlayerModalOpened(true);
        }}
      >
        Add Player
      </Button>
      <Button
        fullWidth
        my="sm"
        variant="light"
        onClick={() => {
          setPlayers((draft) => {
            draft.forEach((player) => {
              player.balance = 100;
            });
          });
        }}
      >
        Reset All Balances
      </Button>
      <Button
        fullWidth
        my="sm"
        variant="light"
        onClick={() => {
          setPlayers((draft) => {
            draft.forEach((player) => {
              player.balance = Math.pow(10, 8);
            });
          });
        }}
      >
        Set Max Balances
      </Button>
      <Button
        fullWidth
        my="sm"
        variant="light"
        color="red"
        disabled={pokerGame.gameState !== "PREROUND" || blackjackGame.gameState !== "PREROUND"}
        onClick={() => {
          if (removeAllConfirm) {
            setPlayers([]);
            setRemoveAllConfirm(false);
          } else setRemoveAllConfirm(true);
        }}
      >
        {removeAllConfirm ? "Are you sure?" : "Remove All Players"}
      </Button>
    </>
  );
}
