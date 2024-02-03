import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Button } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import cx from "clsx";

import { notifications } from "@mantine/notifications";
import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { STATE, STATE_WATCHER, State } from "../App";
import classes from "../styles/Table.module.css";
import PlayerCard from "./PlayerCard";

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
            balance={item.balance}
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
            cards: [
              { rank: "K", suit: "clubs" },
              { rank: "A", suit: "hearts" },
            ],
            id: crypto.randomUUID(),
            name: "Player " + (listState.length + 1),
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
