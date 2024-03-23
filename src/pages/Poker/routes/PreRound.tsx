import {
  KEYBINDINGS_STATE,
  PLAYERS_STATE,
  POKER_GAME_STATE,
  POKER_PLAYERS_STATE,
  POKER_SETTINGS_STATE,
} from "@/Root";
import GenericPlayerCard from "@/components/GenericPlayerCard";
import PlayerSelector, { PlayerSelectorHandles } from "@/components/PlayerSelector";
import { PokerPlayer } from "@/types/Poker";
import { EMPTY_CARD } from "@/utils/CardHelper";
import { formatMoney } from "@/utils/MoneyHelper";
import { useRecoilImmerState } from "@/utils/RecoilImmer";
import { Draggable, DraggableStateSnapshot } from "@hello-pangea/dnd";
import {
  Alert,
  Badge,
  Button,
  ButtonGroup,
  Divider,
  Flex,
  Title,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import {
  IconCircleLetterD,
  IconInfoTriangle,
  IconSpade,
  IconSpadeFilled,
  IconX,
} from "@tabler/icons-react";
import { useRef } from "react";
import { useRecoilState } from "recoil";

function getStyle(style: any, snapshot: DraggableStateSnapshot) {
  if (!snapshot.isDropAnimating) {
    return style;
  }
  const { curve, duration } = snapshot.dropAnimation!;

  return {
    ...style,
    opacity: snapshot.isDragging && !snapshot.isDropAnimating ? 0.65 : 1,
    transition: `all ${curve} ${duration + 500}ms`,
  };
}

export default function PreRound() {
  const theme = useMantineTheme();
  const [pokerSettings] = useRecoilState(POKER_SETTINGS_STATE);
  const [pokerGame, setPokerGame] = useRecoilState(POKER_GAME_STATE);
  const [pokerPlayers, setPokerPlayers] = useRecoilImmerState(POKER_PLAYERS_STATE);
  const [players, setPlayers] = useRecoilImmerState(PLAYERS_STATE);
  const [keybindings] = useRecoilImmerState(KEYBINDINGS_STATE);

  const playerSelectorRef = useRef<PlayerSelectorHandles>(null);

  const setDealer = (playerId: string) => {
    let playerIndex = pokerPlayers.findIndex((player) => player.id == playerId);
    if (playerIndex == -1) return;

    let sbIndex = (playerIndex + 1) % pokerPlayers.length;
    let bbIndex = (playerIndex + 2) % pokerPlayers.length;

    setPokerGame({
      ...pokerGame,
      currentDealer: playerId,
      currentSmallBlind: pokerSettings.forcedBetOption === "BLINDS" ? pokerPlayers[sbIndex].id : "",
      currentBigBlind: pokerSettings.forcedBetOption === "BLINDS" ? pokerPlayers[bbIndex].id : "",
    });
  };

  const anyNegativeBalance = players
    .filter((player) => pokerPlayers.some((p) => p.id == player.id))
    .some((player) => player.balance < 0);

  const cantStart =
    pokerPlayers.length < 2 ||
    !pokerPlayers.some((player) => player.id == pokerGame.currentDealer) ||
    anyNegativeBalance;

  const startGame = () => {
    if (cantStart) {
      console.warn("Cannot start game, not enough players or no dealer selected");
      return;
    }

    setPokerPlayers((draft) => {
      draft.forEach((pokerPlayer: PokerPlayer) => {
        pokerPlayer.allIn = false;
        pokerPlayer.cards = [EMPTY_CARD, EMPTY_CARD];
        pokerPlayer.currentBet = 0;
        pokerPlayer.folded = false;
      });
    });

    let paymentsToTake: { [key: string]: number } = {};
    if (pokerSettings.forcedBetOption === "BLINDS") {
      paymentsToTake[pokerGame.currentSmallBlind] = pokerSettings.smallBlind;
      paymentsToTake[pokerGame.currentBigBlind] = pokerSettings.bigBlind;
    } else {
      pokerPlayers.forEach((player) => {
        paymentsToTake[player.id] = pokerSettings.ante;
      });
    }

    console.log(`Taking payments:`, paymentsToTake);

    setPlayers((draft) => {
      draft.forEach((player) => {
        if (paymentsToTake[player.id]) {
          console.log(`Taking ${paymentsToTake[player.id]} from ${player.name}`);
          player.balance -= paymentsToTake[player.id];
        }
      });
    });

    let firstTurn;
    if (pokerSettings.forcedBetOption === "BLINDS") {
      // To the left of the big blind
      const bbIndex = pokerPlayers.findIndex((player) => player.id == pokerGame.currentBigBlind);
      firstTurn = pokerPlayers[(bbIndex + 1) % pokerPlayers.length].id;
    } else {
      // To the left of the dealer
      const dealerIndex = pokerPlayers.findIndex((player) => player.id == pokerGame.currentDealer);
      firstTurn = pokerPlayers[(dealerIndex + 1) % pokerPlayers.length].id;
    }

    setPokerGame({
      ...pokerGame,
      communityCards: [EMPTY_CARD, EMPTY_CARD, EMPTY_CARD, EMPTY_CARD, EMPTY_CARD],
      currentBet: 0,
      gameState: "PREFLOP",
      currentTurn: firstTurn,
    });
  };

  return (
    <>
      {
        //
        !pokerPlayers.some((player) => player.id == pokerGame.currentDealer) && (
          <Alert color="red" title="No Dealer" icon={<IconInfoTriangle />}>
            <Flex direction="column" gap="sm">
              There is no dealer selected, please select a dealer in order to start the game
            </Flex>
          </Alert>
        )
      }
      {
        //
        anyNegativeBalance && (
          <Alert color="red" title="Negative Balances" icon={<IconInfoTriangle />}>
            <Flex direction="column" gap="sm">
              Some players have negative balances, please top up their balances before starting the
              game
            </Flex>
          </Alert>
        )
      }
      <Button fullWidth mt="sm" onClick={startGame} disabled={cantStart}>
        Start Game (
        {pokerSettings.forcedBetOption == "BLINDS"
          ? `${formatMoney(pokerSettings.smallBlind, true, true)}/${formatMoney(
              pokerSettings.bigBlind,
              true,
              true
            )}`
          : `${formatMoney(pokerSettings.ante, true, true)}`}
        )
      </Button>
      <Button
        variant="light"
        color="gray"
        mt="xs"
        fullWidth
        onClick={() => {
          let dealerIndex = Math.floor(Math.random() * pokerPlayers.length);
          setDealer(pokerPlayers[dealerIndex].id);
        }}
      >
        Pick Random Dealer
      </Button>
      <Button
        variant="light"
        color="gray"
        mt="xs"
        fullWidth
        onClick={() => {
          if (playerSelectorRef.current) playerSelectorRef.current.shuffleListState();
          else console.error("PlayerSelectorRef is null when shuffling", playerSelectorRef);
        }}
      >
        Shuffle Players
      </Button>
      <Divider my="md" />
      <Title order={2} mb="sm">
        Players
      </Title>
      <PlayerSelector
        ref={playerSelectorRef}
        game="POKER"
        playerElement={(index, player, removePlayer, _, pokerPlayer) => {
          if (!pokerPlayer) return <></>;

          return (
            <Draggable key={player.id} index={index} draggableId={player.id}>
              {(provided, snapshot) => (
                <div
                  key={player.id}
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={{
                    ...getStyle(provided.draggableProps.style, snapshot),
                    isDragging: snapshot.isDragging && !snapshot.isDropAnimating,
                    marginBottom: theme.spacing.sm,
                    opacity: snapshot.isDragging && !snapshot.isDropAnimating ? 0.65 : 1,
                  }}
                >
                  <GenericPlayerCard
                    header={player.name}
                    subtext={formatMoney(player.balance)}
                    key={player.id}
                    rightSection={
                      <>
                        <Flex align="center" mr="sm">
                          {pokerGame.currentDealer == player.id && <DealerBadge />}
                          {pokerSettings.forcedBetOption == "BLINDS" &&
                            pokerGame.currentSmallBlind == player.id && <SmallBlindBadge />}
                          {pokerSettings.forcedBetOption == "BLINDS" &&
                            pokerGame.currentBigBlind == player.id && <BigBlindBadge />}
                        </Flex>
                        <ButtonGroup>
                          <Tooltip
                            label="Set Dealer"
                            transitionProps={{ transition: "fade", duration: 100 }}
                            openDelay={300}
                          >
                            <Button
                              fullWidth
                              variant="light"
                              color="blue"
                              disabled={pokerGame.currentDealer == player.id}
                              style={{
                                backgroundColor:
                                  pokerGame.currentDealer == player.id
                                    ? theme.colors.dark[5]
                                    : undefined,
                              }}
                              onClick={() => {
                                setDealer(player.id);
                              }}
                            >
                              <IconCircleLetterD size="1.25rem" />
                            </Button>
                          </Tooltip>
                          <Button
                            fullWidth
                            variant="light"
                            color="red"
                            onClick={() => {
                              removePlayer(player.id);
                              setPokerGame({
                                ...pokerGame,
                                currentDealer: "",
                                currentSmallBlind: "",
                                currentBigBlind: "",
                              });
                            }}
                          >
                            <IconX size="1.25rem" />
                          </Button>
                        </ButtonGroup>
                      </>
                    }
                  />
                </div>
              )}
            </Draggable>
          );
        }}
      />
    </>
  );
}

export function DealerBadge() {
  const theme = useMantineTheme();

  return (
    <Badge
      size="xl"
      circle
      style={{
        backgroundColor: theme.colors.gray[1],
        color: theme.colors.dark[6],
        fontSize: "0.70rem",
        fontWeight: 800,
      }}
    >
      BTN
    </Badge>
  );
}

export function BigBlindBadge() {
  return (
    <Badge
      color="yellow"
      size="xl"
      circle
      style={{
        fontSize: "0.90rem",
        fontWeight: 700,
      }}
    >
      BB
    </Badge>
  );
}

export function SmallBlindBadge() {
  return (
    <Badge
      color="blue"
      size="xl"
      circle
      style={{
        fontSize: "0.90rem",
        fontWeight: 700,
      }}
    >
      SB
    </Badge>
  );
}
