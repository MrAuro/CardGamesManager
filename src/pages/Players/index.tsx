import { PLAYERS_STATE } from "@/stores/Players";
import { useRecoilImmerState } from "@/utils/RecoilImmer";
import { Button } from "@mantine/core";
import { useState } from "react";
import PlayerItem from "./components/PlayerItem";
import PlayerModal from "./components/PlayerModal";

export default function Players() {
  const [players, setPlayers] = useRecoilImmerState(PLAYERS_STATE);

  const [playerModalOpened, setPlayerModalOpened] = useState(false);
  const [playerIdToEdit, setPlayerIdToEdit] = useState<string | null>(null);
  const [playerModalTitle, setPlayerModalTitle] = useState("Add Player");

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
          if (playerIdToEdit)
            setPlayers((draft) => {
              const index = draft.findIndex((p) => p.id === playerIdToEdit);
              draft.splice(index, 1);
            });
        }}
      />
      {players.map((player) => (
        <PlayerItem
          player={player}
          key={player.id}
          onClick={() => {
            setPlayerIdToEdit(player.id);
            setPlayerModalTitle("Edit Player");
            setPlayerModalOpened(true);
          }}
        />
      ))}
      <Button
        fullWidth
        onClick={() => {
          setPlayerIdToEdit(null);
          setPlayerModalTitle("Add Player");
          setPlayerModalOpened(true);
        }}
      >
        Add Player
      </Button>
    </>
  );
}
