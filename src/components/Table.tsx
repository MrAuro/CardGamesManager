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
import CommunityCards from "./CommunityCards";

export function Table() {
  const [state, setState] = useRecoilState<State>(STATE);
  const val = useRecoilValue<State>(STATE_WATCHER);

  const [listState, handlers] = useListState(val.players);

  useEffect(() => {
    const previousDealer = state.players[val.dealerIndex];
    const dealerIndex = listState.indexOf(previousDealer);

    setState({
      ...state,
      // Not really sure what this is doing but it works
      dealerIndex: dealerIndex == -1 ? val.dealerIndex : dealerIndex,
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
          <PlayerCard player={item} handler={handlers} />
        </div>
      )}
    </Draggable>
  ));

  return (
    <>
      <CommunityCards cards={val.communityCards} />
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
              { rank: "NONE", suit: "NONE" },
              { rank: "NONE", suit: "NONE" },
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
