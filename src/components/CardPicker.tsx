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
import { Card, CardRank, CardSuit } from "../utils/Game";
import { useRecoilValue } from "recoil";
import { USED_CARDS } from "../App";

export default function CardPicker(props: {
  setCardModelOpened: boolean;
  saveCard: () => void;
  setCardRank: CardRank;
  setSetCardRank: (rank: CardRank) => void;
  setSetCardSuit: (suit: CardSuit) => void;
  setCardSuit: CardSuit;
}) {
  const theme = useMantineTheme();
  const usedCards = useRecoilValue<Card[]>(USED_CARDS);

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
              disabled={usedCards.some(
                (card) => card.rank == "2" && card.suit == props.setCardSuit
              )}
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
              disabled={usedCards.some(
                (card) => card.rank == "3" && card.suit == props.setCardSuit
              )}
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
              disabled={usedCards.some(
                (card) => card.rank == "4" && card.suit == props.setCardSuit
              )}
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
              disabled={usedCards.some(
                (card) => card.rank == "5" && card.suit == props.setCardSuit
              )}
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
              disabled={usedCards.some(
                (card) => card.rank == "6" && card.suit == props.setCardSuit
              )}
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
              disabled={usedCards.some(
                (card) => card.rank == "7" && card.suit == props.setCardSuit
              )}
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
              disabled={usedCards.some(
                (card) => card.rank == "8" && card.suit == props.setCardSuit
              )}
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
              disabled={usedCards.some(
                (card) => card.rank == "9" && card.suit == props.setCardSuit
              )}
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
              disabled={usedCards.some(
                (card) => card.rank == "10" && card.suit == props.setCardSuit
              )}
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
              disabled={usedCards.some(
                (card) => card.rank == "J" && card.suit == props.setCardSuit
              )}
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
              disabled={usedCards.some(
                (card) => card.rank == "Q" && card.suit == props.setCardSuit
              )}
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
              disabled={usedCards.some(
                (card) => card.rank == "K" && card.suit == props.setCardSuit
              )}
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
              disabled={usedCards.some(
                (card) => card.rank == "A" && card.suit == props.setCardSuit
              )}
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
            disabled={usedCards.some(
              (card) => card.rank == props.setCardRank && card.suit == "clubs"
            )}
            onClick={() => props.setSetCardSuit("clubs")}
            color="gray.0"
            styles={{
              icon: {
                color:
                  props.setCardSuit == "clubs"
                    ? theme.colors.dark[8]
                    : usedCards.some(
                        (card) =>
                          card.rank == props.setCardRank && card.suit == "clubs"
                      )
                    ? theme.colors.dark[3]
                    : "white",
              },
            }}
          >
            <IconClubsFilled />
          </ActionIcon>
          <ActionIcon
            radius="sm"
            size="xl"
            variant={props.setCardSuit == "diamonds" ? "filled" : "outline"}
            disabled={usedCards.some(
              (card) =>
                card.rank == props.setCardRank && card.suit == "diamonds"
            )}
            onClick={() => props.setSetCardSuit("diamonds")}
            color="#ff2626"
          >
            <IconDiamondsFilled />
          </ActionIcon>
          <ActionIcon
            radius="sm"
            size="xl"
            variant={props.setCardSuit == "spades" ? "filled" : "outline"}
            disabled={usedCards.some(
              (card) => card.rank == props.setCardRank && card.suit == "spades"
            )}
            onClick={() => props.setSetCardSuit("spades")}
            color="gray.0"
            styles={{
              icon: {
                color:
                  props.setCardSuit == "spades"
                    ? theme.colors.dark[8]
                    : usedCards.some(
                        (card) =>
                          card.rank == props.setCardRank &&
                          card.suit == "spades"
                      )
                    ? theme.colors.dark[3]
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
            disabled={usedCards.some(
              (card) => card.rank == props.setCardRank && card.suit == "hearts"
            )}
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
