import { BLACKJACK_PLAYERS_STATE, PLAYERS_STATE } from "@/Root";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { BlackjackPlayer } from "@/types/Blackjack";
import { Player } from "@/types/Player";
import { formatMoney } from "@/utils/MoneyHelper";
import { getPlayer } from "@/utils/PlayerHelper";
import { useRecoilImmerState } from "@/utils/RecoilImmer";
import { Select, Text } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export default function PlayerSelector({
  game,
  playerElement,
}: {
  game: "BLACKJACK" | "POKER";
  playerElement: (
    index: number,
    player: Player,
    removePlayer: (id: string) => void,
    blackjackPlayer?: BlackjackPlayer,
    pokerPlayer?: any
  ) => JSX.Element;
}) {
  const [players] = useRecoilImmerState(PLAYERS_STATE);

  const [blackjackPlayers, setBlackjackPlayers] = useRecoilImmerState(BLACKJACK_PLAYERS_STATE);
  // TODO: Add poker players state

  const [listState, handlers] = useListState<string>(
    game == "BLACKJACK" ? blackjackPlayers.map((player) => player.id) : []
  );
  // TODO: Map poker players instead of an empty array

  const removePlayer = (id: string) => {
    handlers.filter((playerId) => playerId !== id);
  };

  useEffect(() => {
    let orderedPlayers = listState.map((id) => blackjackPlayers.find((p) => p.id === id)!);

    orderedPlayers = orderedPlayers.filter((p) => p != undefined);

    setBlackjackPlayers(orderedPlayers);
  }, [listState]);

  // Immediately clears the selection
  // https://discord.com/channels/854810300876062770/1202574436516237323/1202575107290304522 (Mantine Discord)
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>();
  useEffect(() => {
    setSelectedPlayer(null);
  }, [selectedPlayer]);

  return (
    <>
      <Select
        key={selectedPlayer}
        placeholder="Add Player"
        leftSectionPointerEvents="none"
        leftSection={<IconSearch size="1.25rem" />}
        clearable
        searchable
        radius="md"
        mb="sm"
        value={selectedPlayer}
        data={players
          .filter((player) => !listState.includes(player.id))
          .map((player) => ({
            value: player.id,
            label: `${player.name} (${formatMoney(player.balance)})`,
          }))}
        onChange={(_value, option) => {
          setSelectedPlayer(option.value);
          let player = getPlayer(option.value, players);
          if (!player) return console.error("Player not found");

          if (game == "BLACKJACK") {
            setBlackjackPlayers((draft) => {
              draft.push({
                id: player!.id,
                bet: 0,
                cards: [],
                displayName: player!.name,
                doubledDown: false,
                errors: [],
                sidebets: {
                  betBehind: {
                    bet: 0,
                    target: null,
                  },
                  perfectPairs: 0,
                  twentyOnePlusThree: 0,
                },
                split: false,
              });
            });
          } else {
            // TODO
          }
          handlers.append(option.value);
        }}
      />
      {blackjackPlayers.length < 1 && (
        <Text ta="center" size="md" fw="bold">
          No players added
        </Text>
      )}
      <DragDropContext
        onDragEnd={({ destination, source }) => {
          handlers.reorder({
            from: source.index,
            to: destination?.index || 0,
          });
        }}
      >
        <Droppable droppableId="players" direction="vertical">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {listState.map((id, index) => {
                return playerElement(
                  index,
                  getPlayer(id, players)!,
                  removePlayer,
                  blackjackPlayers.find((player) => player.id == id)
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
}
