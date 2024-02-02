import {
  DragDropContext,
  Draggable,
  DraggableLocation,
  Droppable,
} from "@hello-pangea/dnd";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Menu,
  NumberInput,
  Paper,
  Text,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import {
  IconBolt,
  IconChevronDown,
  IconCoin,
  IconCurrencyDollar,
  IconDots,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import cx from "clsx";
import { useState } from "react";
import { Card, CardType } from "./Card";

import classes from "./Table.module.css";

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
  const theme = useMantineTheme();

  // const [state, handlers] = useListState();

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

function Player(props: {
  name: string;
  turn: boolean;
  role: string;
  cards: CardType[];
}) {
  const theme = useMantineTheme();
  const [isBetting, setIsBetting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const openModal = () =>
    modals.openConfirmModal({
      title: `Placing Bet`,
      centered: true,
      children: (
        <NumberInput
          label="Bet Amount"
          allowNegative={false}
          decimalScale={2}
          fixedDecimalScale
          defaultValue={0}
          leftSection={<IconCurrencyDollar />}
        />
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onCancel: () => console.log("Cancel"),
      onConfirm: () => console.log("Confirmed"),
    });

  return (
    <Paper
      withBorder
      radius="md"
      styles={{
        root: {
          backgroundColor: props.turn
            ? theme.colors.dark[8]
            : theme.colors.dark[7],
        },
      }}
    >
      <Box m="xs">
        <Group grow justify="space-between">
          <div>
            <Text size={props.turn ? "xl" : "lg"} fw={props.turn ? 700 : 500}>
              {props.name}{" "}
              <Menu position="bottom-start">
                <Menu.Target>
                  <ActionIcon
                    variant="transparent"
                    color={theme.colors.dark[1]}
                    onClick={() => setShowMenu(!showMenu)}
                  >
                    <IconChevronDown
                      style={{ width: rem(20), height: rem(20) }}
                    />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Bought in with $12.23</Menu.Label>
                  <Menu.Divider />
                  <Menu.Label>Actions</Menu.Label>
                  <Menu.Item
                    leftSection={
                      <IconPencil style={{ width: rem(20), height: rem(20) }} />
                    }
                  >
                    Change Name
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <IconCoin style={{ width: rem(20), height: rem(20) }} />
                    }
                  >
                    Set Balance
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <IconBolt style={{ width: rem(20), height: rem(20) }} />
                    }
                  >
                    Force Turn
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <IconTrash style={{ width: rem(20), height: rem(20) }} />
                    }
                    color="red"
                  >
                    Remove Player
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
              {/* {props.role && (
                  <Badge
                    ml="xs"
                    variant="light"
                    color={props.turn ? "blue" : "gray"}
                  >
                    {props.role}
                  </Badge>
                )} */}
            </Text>
            <Text size={props.turn ? "md" : "sm"} c="dimmed">
              $21.23
            </Text>
          </div>
          <Group justify="flex-end">
            {props.cards.map((card, i) => (
              <Card key={i} value={card.value} suit={card.suit} />
            ))}
          </Group>
        </Group>
        <Divider my="xs" />
        <Group grow gap="xs" justify="center">
          <Button color="blue" variant="light" disabled={!props.turn}>
            Check
          </Button>
          <Button color="red" variant="light" disabled={!props.turn}>
            Fold
          </Button>
          <Button
            color="green"
            variant="light"
            disabled={!props.turn}
            onClick={openModal}
          >
            Bet
          </Button>
        </Group>
      </Box>
    </Paper>
  );
}

function newId(): string {
  return `${Math.floor(Math.random() * 1_000_000)}`;
}
