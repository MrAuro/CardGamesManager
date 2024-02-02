import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Button, useMantineTheme } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import cx from "clsx";

import classes from "../styles/Table.module.css";
import { STATE, STATE_WATCHER, State } from "../App";
import { useRecoilState, useRecoilValue } from "recoil";
import { Player } from "../utils/Game";
import PlayerCard from "./PlayerCard";
import { useEffect } from "react";

export function Table() {
  const [state, setState] = useRecoilState(STATE);
  const val = useRecoilValue<State>(STATE_WATCHER);

  const [listState, handlers] = useListState(val.players);

  useEffect(() => {
    setState({
      ...state,
      players: listState,
    });
  }, [listState]);

  const items = listState.map((item, index) => (
    <Draggable key={item.id} index={index} draggableId={item.id}>
      {(provided, snapshot) => (
        <div
          className={cx(classes.item, {
            [classes.itemDragging]: snapshot.isDragging,
          })}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <PlayerCard
            name={item.name}
            role={""}
            turn={true}
            cards={item.cards}
            id={item.id}
            handler={handlers}
          />
        </div>
      )}
    </Draggable>
  ));

  return (
    <>
      <DragDropContext
        onDragEnd={({ destination, source }) => {
          handlers.reorder({ from: source.index, to: destination?.index || 0 });
        }}
      >
        <Droppable droppableId="dnd-list" direction="vertical">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {items}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <Button
        variant="subtle"
        fullWidth
        onClick={() => {
          handlers.append({
            balance: 0,
            cards: [],
            id: crypto.randomUUID(),
            name: "Player " + (listState.length + 1),
          });
        }}
      >
        Add Player
      </Button>
    </>
  );
}
