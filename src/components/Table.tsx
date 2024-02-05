import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Button } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import cx from "clsx";

import { notifications } from "@mantine/notifications";
import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { GameState, STATE, State } from "../App";
import classes from "../styles/Table.module.css";
import { EMPTY_CARD, Player } from "../utils/Game";
import ImprovedPlayerCard from "./ImprovedPlayerCard";
import ImprovedCommunityCards from "./ImprovedCommunityCards";

export function Table() {
  const [state, setState] = useRecoilState<State>(STATE);

  const [listState, handlers] = useListState<string>(
    state.players.map((p) => p.id)
  );

  useEffect(() => {
    // Instead of setting the state to listState, we reorder the players
    // based on the listState order to ensure that the players have the
    // correct data

    let orderedPlayers = listState.map(
      (id) => state.players.find((p) => p.id === id)!
    );

    orderedPlayers = orderedPlayers.filter((p) => p != undefined);

    setState({
      ...state,
      players: orderedPlayers,
    });
  }, [listState]);

  const players = listState.map((player, index) => (
    <Draggable key={player} index={index} draggableId={player}>
      {(provided, snapshot) => (
        <div
          className={cx(classes.item, {
            [classes.itemDragging]: snapshot.isDragging,
          })}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          {state.players.find((p) => p.id === player) != undefined && (
            <ImprovedPlayerCard
              player={state.players.find((p) => p.id === player)!}
              handler={handlers}
            />
          )}
        </div>
      )}
    </Draggable>
  ));

  return (
    <>
      <ImprovedCommunityCards />
      <DragDropContext
        onDragEnd={({ destination, source }) => {
          handlers.reorder({ from: source.index, to: destination?.index || 0 });
        }}
      >
        <Droppable droppableId="dnd-list" direction="vertical">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {players}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <Button
        fullWidth
        disabled={state.gameState !== GameState.EDITING}
        onClick={() => {
          const newPlayer: Player = {
            balance: 10,
            cards: [EMPTY_CARD, EMPTY_CARD],
            id: crypto.randomUUID(),
            name: "Player " + state.players.length,
            position: "NONE",
            isPlaying: false,
          };

          handlers.append(newPlayer.id);

          setState({
            ...state,
            players: [...state.players, newPlayer],
          });

          notifications.show({
            message: "Player Added",
            color: "green",
          });
        }}
      >
        Add Player
      </Button>
    </>
  );
}
