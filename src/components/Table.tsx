import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useMantineTheme } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import cx from "clsx";
import { CardType } from "./Card";

import classes from "../styles/Table.module.css";
import Player from "./Player";

type Player = {
  name: string;
  role: string;
  turn: boolean;
  id: string;
  cards: CardType[];
};

const data: Player[] = [
  {
    name: "Michael",
    role: "BTN",
    turn: true,
    id: newId(),
    cards: [
      { value: "A", suit: "hearts" },
      { value: "K", suit: "hearts" },
    ],
  },
  {
    name: "Jim",
    role: "BB",
    turn: false,
    id: newId(),
    cards: [
      { value: "2", suit: "clubs" },
      { value: "5", suit: "diamonds" },
    ],
  },
  {
    name: "Oscar",
    role: "SB",
    turn: false,
    id: newId(),
    cards: [
      { value: "7", suit: "spades" },
      { value: "J", suit: "hearts" },
    ],
  },
  {
    name: "Stanley",
    role: "",
    turn: false,
    id: newId(),
    cards: [
      { value: "A", suit: "spades" },
      { value: "A", suit: "spades" },
    ],
  },
];

export function Table() {
  const [state, handlers] = useListState(data);

  const items = state.map((item, index) => (
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
          <Player
            name={item.name}
            role={item.role}
            turn={item.turn}
            cards={item.cards}
          />
        </div>
      )}
    </Draggable>
  ));

  return (
    <DragDropContext
      onDragEnd={({ destination, source }) =>
        handlers.reorder({ from: source.index, to: destination?.index || 0 })
      }
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
  );
}

function newId(): string {
  return `${Math.floor(Math.random() * 1_000_000)}`;
}
