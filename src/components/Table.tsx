import {
  Paper,
  Title,
  Text,
  Box,
  SimpleGrid,
  useMantineTheme,
  Button,
  Center,
  Group,
  NumberInput,
  Pill,
  Badge,
  Collapse,
  Divider,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { useState } from "react";
import ReactGridLayout from "react-grid-layout";
import { IconCurrencyDollar } from "@tabler/icons-react";

export function Table() {
  /*
  const [layout, setLayout] = useState([
    { i: "a", x: 0, y: 0, w: 1, h: 2, static: true },
    { i: "b", x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 },
    { i: "c", x: 4, y: 0, w: 1, h: 2 },
  ]);

    <ReactGridLayout
      className="layout"
      layout={layout}
      cols={12}
      rowHeight={30}
      width={1200}
    >
      <div key="a"></div>
      <div key="b"></div>
      <div key="c"></div>
    </ReactGridLayout>
*/
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }}>
      <Player name="John" turn role="BTN" />
      <Player name="Doe" role="BB" />
      <Player name="Test" role="SB" />
      <Player name="Asdfasdf" role="" />
    </SimpleGrid>
  );
}

function Player(props: { name: string; turn?: boolean; role: string }) {
  const theme = useMantineTheme();
  const [isBetting, setIsBetting] = useState(false);

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
      styles={{
        root: {
          backgroundColor: props.turn
            ? theme.colors.dark[8]
            : theme.colors.dark[7],
        },
      }}
    >
      <Box m="xs">
        <Text size="xl" fw={props.turn ? 700 : 500}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {props.name}{" "}
            {props.role && (
              <Badge
                ml="xs"
                variant="light"
                color={props.turn ? "blue" : "gray"}
              >
                {props.role}
              </Badge>
            )}
          </div>
        </Text>
        <Text size="sm" c="dimmed">
          $21.23
        </Text>
        <Divider my="xs" />
        <Group grow gap="xs" justify="center">
          <Button color="blue" variant="light" disabled={!!!props.turn}>
            Check
          </Button>
          <Button color="red" variant="light" disabled={!!!props.turn}>
            Fold
          </Button>
          <Button
            color="green"
            variant="light"
            disabled={!!!props.turn}
            onClick={openModal}
          >
            Bet
          </Button>
        </Group>
      </Box>
    </Paper>
  );
}
