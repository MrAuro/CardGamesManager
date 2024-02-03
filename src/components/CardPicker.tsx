import {
  Button,
  Modal,
  SimpleGrid,
  Group,
  ActionIcon,
  Divider,
  useMantineTheme,
} from "@mantine/core";
import {
  IconSpadeFilled,
  IconClubsFilled,
  IconHeartFilled,
  IconDiamondsFilled,
} from "@tabler/icons-react";
import { CardRank, CardSuit } from "../utils/Game";

export default function CardPicker(props: {
  setCardModelOpened: boolean;
  saveCard: () => void;
  setCardRank: CardRank;
  setSetCardRank: (rank: CardRank) => void;
  setSetCardSuit: (suit: CardSuit) => void;
  setCardSuit: CardSuit;
}) {
  const theme = useMantineTheme();

  return (
    <Modal
      opened={props.setCardModelOpened}
      onClose={props.saveCard}
      title="Set Card"
      centered
      radius="md"
    >
      <>
        <Group grow>
          <SimpleGrid cols={{ sm: 7, xs: 2 }} spacing="xs" verticalSpacing="xs">
            <Button
              radius="md"
              size="compact-xl"
              fullWidth
              p="xs"
              fw="bold"
              justify="center"
              variant={props.setCardRank == "2" ? "filled" : "outline"}
              onClick={() => {
                props.setSetCardRank("2");
              }}
            >
              {" "}
              2
            </Button>
            <Button
              radius="md"
              size="compact-xl"
              fullWidth
              p="xs"
              fw="bold"
              justify="center"
              variant={props.setCardRank == "3" ? "filled" : "outline"}
              onClick={() => {
                props.setSetCardRank("3");
              }}
            >
              {" "}
              3
            </Button>
            <Button
              radius="md"
              size="compact-xl"
              fullWidth
              p="xs"
              fw="bold"
              justify="center"
              variant={props.setCardRank == "4" ? "filled" : "outline"}
              onClick={() => {
                props.setSetCardRank("4");
              }}
            >
              {" "}
              4
            </Button>
            <Button
              radius="md"
              size="compact-xl"
              fullWidth
              p="xs"
              fw="bold"
              justify="center"
              variant={props.setCardRank == "5" ? "filled" : "outline"}
              onClick={() => {
                props.setSetCardRank("5");
              }}
            >
              {" "}
              5
            </Button>
            <Button
              radius="md"
              size="compact-xl"
              fullWidth
              p="xs"
              fw="bold"
              justify="center"
              variant={props.setCardRank == "6" ? "filled" : "outline"}
              onClick={() => {
                props.setSetCardRank("6");
              }}
            >
              {" "}
              6
            </Button>
            <Button
              radius="md"
              size="compact-xl"
              fullWidth
              p="xs"
              fw="bold"
              justify="center"
              variant={props.setCardRank == "7" ? "filled" : "outline"}
              onClick={() => {
                props.setSetCardRank("7");
              }}
            >
              {" "}
              7
            </Button>
            <Button
              radius="md"
              size="compact-xl"
              fullWidth
              p="xs"
              fw="bold"
              justify="center"
              variant={props.setCardRank == "8" ? "filled" : "outline"}
              onClick={() => {
                props.setSetCardRank("8");
              }}
            >
              {" "}
              8
            </Button>
            <Button
              radius="md"
              size="compact-xl"
              fullWidth
              p="xs"
              fw="bold"
              justify="center"
              variant={props.setCardRank == "9" ? "filled" : "outline"}
              onClick={() => {
                props.setSetCardRank("9");
              }}
            >
              {" "}
              9
            </Button>
            <Button
              radius="md"
              size="compact-xl"
              fullWidth
              p="xs"
              fw="bold"
              justify="center"
              variant={props.setCardRank == "10" ? "filled" : "outline"}
              onClick={() => {
                props.setSetCardRank("10");
              }}
            >
              {" "}
              10
            </Button>
            <Button
              radius="md"
              size="compact-xl"
              fullWidth
              p="xs"
              fw="bold"
              justify="center"
              variant={props.setCardRank == "J" ? "filled" : "outline"}
              onClick={() => {
                props.setSetCardRank("J");
              }}
            >
              {" "}
              J
            </Button>
            <Button
              radius="md"
              size="compact-xl"
              fullWidth
              p="xs"
              fw="bold"
              justify="center"
              variant={props.setCardRank == "Q" ? "filled" : "outline"}
              onClick={() => {
                props.setSetCardRank("Q");
              }}
            >
              {" "}
              Q
            </Button>
            <Button
              radius="md"
              size="compact-xl"
              fullWidth
              p="xs"
              fw="bold"
              justify="center"
              variant={props.setCardRank == "K" ? "filled" : "outline"}
              onClick={() => {
                props.setSetCardRank("K");
              }}
            >
              {" "}
              K
            </Button>
            <Button
              radius="md"
              size="compact-xl"
              fullWidth
              p="xs"
              fw="bold"
              justify="center"
              variant={props.setCardRank == "A" ? "filled" : "outline"}
              onClick={() => {
                props.setSetCardRank("A");
              }}
            >
              A
            </Button>
            <Button
              radius="md"
              size="compact-xl"
              fullWidth
              p="xs"
              fw="bold"
              justify="center"
              variant={props.setCardRank == "NONE" ? "filled" : "outline"}
              onClick={() => {
                props.setSetCardRank("NONE");
                props.setSetCardSuit("NONE");
              }}
            >
              /
            </Button>
          </SimpleGrid>
        </Group>
        <Divider my="md" />
        <Group justify="center" grow>
          <ActionIcon
            radius="sm"
            size="xl"
            variant={props.setCardSuit == "clubs" ? "filled" : "outline"}
            onClick={() => props.setSetCardSuit("clubs")}
            color="gray.0"
            styles={{
              icon: {
                color:
                  props.setCardSuit == "clubs" ? theme.colors.dark[8] : "white",
              },
            }}
          >
            <IconClubsFilled />
          </ActionIcon>
          <ActionIcon
            radius="sm"
            size="xl"
            variant={props.setCardSuit == "diamonds" ? "filled" : "outline"}
            onClick={() => props.setSetCardSuit("diamonds")}
            color="#ff2626"
          >
            <IconDiamondsFilled />
          </ActionIcon>
          <ActionIcon
            radius="sm"
            size="xl"
            variant={props.setCardSuit == "spades" ? "filled" : "outline"}
            onClick={() => props.setSetCardSuit("spades")}
            color="gray.0"
            styles={{
              icon: {
                color:
                  props.setCardSuit == "spades"
                    ? theme.colors.dark[8]
                    : "white",
              },
            }}
          >
            <IconSpadeFilled />
          </ActionIcon>
          <ActionIcon
            radius="sm"
            size="xl"
            variant={props.setCardSuit == "hearts" ? "filled" : "outline"}
            onClick={() => props.setSetCardSuit("hearts")}
            color="#ff2626"
          >
            <IconHeartFilled />
          </ActionIcon>
        </Group>
        {/* 2,3,4,5,6
                        7,8,9,T
                        J,Q,K,A */}

        <Divider my="md" />
        <Button fullWidth onClick={props.saveCard}>
          Save
        </Button>
      </>
    </Modal>
  );
}
