import { useRecoilState } from "recoil";
import { STATE, State } from "../App";
import { Player } from "../types/Player";
import {
  ActionIcon,
  Box,
  Container,
  Group,
  Paper,
  Text,
  rem,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { IconGripVertical, IconPencil } from "@tabler/icons-react";
import PlayingCard from "./PlayingCard";
import classes from "../styles/PlayingList.module.css";
import { useCustomRecoilState } from "../utils/RecoilHelper";

export default function DealerItem(props: {
  my?: string;
  disabled?: boolean;
  leftCardItem?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const [state, setState, modifyState] = useCustomRecoilState<State>(STATE);

  return (
    <Paper
      withBorder
      radius="md"
      my={props.my ?? undefined}
      p="xs"
      styles={{
        root: {
          // height: "3rem",
          backgroundColor:
            colorScheme === "dark"
              ? !props.disabled
                ? theme.colors.dark[6]
                : theme.colors.dark[7]
              : !props.disabled
              ? theme.colors.gray[0]
              : theme.colors.gray[1],
          display: "flex", // Add this line to make the container a flex container
          alignItems: "center", // Vertically center the items
        },
      }}
    >
      <Container
        style={{
          flex: 1,
          justifyContent: "space-between",
        }}
        pl="sm"
      >
        <Group justify="space-between">
          <Paper style={{ backgroundColor: "transparent" }}>
            <Text size="xl" fw={!props.disabled ? "bolder" : "bold"} tt="capitalize">
              Dealer
            </Text>
          </Paper>

          <Paper
            style={{
              backgroundColor: "transparent",

              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Box ml="xs">{props.leftCardItem}</Box>
            {state.blackjack.dealerCards.map((card, index) => (
              <Box ml="xs" key={`DEALER${card}${index}`}>
                <PlayingCard card={card} onClick={() => {}} disabled={!props.disabled} />
              </Box>
            ))}
          </Paper>
        </Group>
        {props.children}
      </Container>
    </Paper>
  );
}
