import {
  KEYBINDINGS_STATE,
  PLAYERS_STATE,
  POKER_GAME_STATE,
  POKER_PLAYERS_STATE,
  POKER_SETTINGS_STATE,
} from "@/Root";
import GenericPlayerCard from "@/components/GenericPlayerCard";
import PlayerSelector, { PlayerSelectorHandles } from "@/components/PlayerSelector";
import { PokerPlayer, PokerSettings } from "@/types/Poker";
import { EMPTY_CARD } from "@/utils/CardHelper";
import { formatMoney, round } from "@/utils/MoneyHelper";
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
  IconTriangleFilled,
  IconX,
} from "@tabler/icons-react";
import { useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
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

export const getDealerData = (
  dealerId: string,
  pokerSettings: PokerSettings,
  pokerPlayers: PokerPlayer[]
): {
  currentDealer: string;
  currentSmallBlind: string;
  currentBigBlind: string;
} => {
  let playerIndex = pokerPlayers.findIndex((player) => player.id == dealerId);
  if (playerIndex == -1) throw new Error(`Player with ID ${dealerId} not found in pokerPlayers`);

  let sbIndex = (playerIndex + 1) % pokerPlayers.length;
  let bbIndex = (playerIndex + 2) % pokerPlayers.length;

  return {
    currentDealer: dealerId,
    currentSmallBlind:
      pokerSettings.forcedBetOption === "BLINDS" || pokerSettings.forcedBetOption === "BLINDS+ANTE"
        ? pokerPlayers[sbIndex].id
        : "",
    currentBigBlind:
      pokerSettings.forcedBetOption === "BLINDS" || pokerSettings.forcedBetOption === "BLINDS+ANTE"
        ? pokerPlayers[bbIndex].id
        : "",
  };
};

export default function PreRound() {
  const theme = useMantineTheme();
  const [pokerSettings] = useRecoilState(POKER_SETTINGS_STATE);
  const [pokerGame, setPokerGame] = useRecoilState(POKER_GAME_STATE);
  const [pokerPlayers, setPokerPlayers] = useRecoilImmerState(POKER_PLAYERS_STATE);
  const [players, setPlayers] = useRecoilImmerState(PLAYERS_STATE);
  const [keybindings] = useRecoilImmerState(KEYBINDINGS_STATE);

  const playerSelectorRef = useRef<PlayerSelectorHandles>(null);

  keybindings.forEach((keybinding) => {
    if (keybinding.scope === "Poker PreRound") {
      useHotkeys(keybinding.key, () => {
        switch (keybinding.action) {
          case "Start Game":
            startGame();
            break;

          case "Next Dealer":
            setPokerGame({
              ...pokerGame,
              ...getDealerData(
                pokerPlayers[
                  (pokerPlayers.findIndex((player) => player.id == pokerGame.currentDealer) + 1) %
                    pokerPlayers.length
                ].id,
                pokerSettings,
                pokerPlayers
              ),
            });
            break;

          case "Random Dealer":
            let dealerIndex = Math.floor(Math.random() * pokerPlayers.length);
            setPokerGame({
              ...pokerGame,
              ...getDealerData(pokerPlayers[dealerIndex].id, pokerSettings, pokerPlayers),
            });
            break;

          case "Shuffle Players":
            if (playerSelectorRef.current) playerSelectorRef.current.shuffleListState();
            else console.error("PlayerSelectorRef is null when shuffling", playerSelectorRef);
            break;
        }
      });
    }
  });

  const anyNegativeBalance = players
    .filter((player) => pokerPlayers.some((p) => p.id == player.id))
    .some(
      (player) =>
        player.balance <=
        (pokerSettings.forcedBetOption == "BLINDS"
          ? pokerSettings.bigBlind
          : pokerSettings.forcedBetOption == "BLINDS+ANTE"
          ? pokerSettings.ante + pokerSettings.bigBlind
          : pokerSettings.ante)
    );

  const cantStart =
    pokerPlayers.length < 2 ||
    !pokerPlayers.some((player) => player.id == pokerGame.currentDealer) ||
    anyNegativeBalance;

  const startGame = () => {
    if (cantStart) {
      console.warn("Cannot start game, not enough players or no dealer selected");
      return;
    }

    let amountInPot = 0;
    let paymentsToTake: { [key: string]: number } = {};
    for (const player of pokerPlayers) {
      paymentsToTake[player.id] = 0;
    }
    if (
      pokerSettings.forcedBetOption === "BLINDS" ||
      pokerSettings.forcedBetOption == "BLINDS+ANTE"
    ) {
      paymentsToTake[pokerGame.currentSmallBlind] += pokerSettings.smallBlind;
      paymentsToTake[pokerGame.currentBigBlind] += pokerSettings.bigBlind;
    }

    if (
      pokerSettings.forcedBetOption === "ANTE" ||
      pokerSettings.forcedBetOption === "BLINDS+ANTE"
    ) {
      pokerPlayers.forEach((player) => {
        paymentsToTake[player.id] += pokerSettings.ante;
      });
    }

    setPokerPlayers((draft) => {
      draft.forEach((pokerPlayer: PokerPlayer) => {
        pokerPlayer.allIn = false;
        pokerPlayer.cards = [EMPTY_CARD, EMPTY_CARD];
        pokerPlayer.currentBet = 0;
        pokerPlayer.folded = false;
        pokerPlayer.currentBet = paymentsToTake[pokerPlayer.id] || 0;
        pokerPlayer.beenOn = false;
      });
    });

    console.log(`Taking payments:`, paymentsToTake);

    setPlayers((draft) => {
      draft.forEach((player) => {
        if (paymentsToTake[player.id]) {
          console.log(`Taking ${paymentsToTake[player.id]} from ${player.name}`);
          player.balance = round(player.balance - paymentsToTake[player.id]);
          amountInPot += round(paymentsToTake[player.id]);
        }
      });
    });

    let firstTurn;
    if (
      pokerSettings.forcedBetOption == "BLINDS" ||
      pokerSettings.forcedBetOption == "BLINDS+ANTE"
    ) {
      // To the left of the big blind
      const bbIndex = pokerPlayers.findIndex((player) => player.id == pokerGame.currentBigBlind);
      firstTurn = pokerPlayers[(bbIndex + 1) % pokerPlayers.length].id;
    } else {
      // To the left of the dealer
      const dealerIndex = pokerPlayers.findIndex((player) => player.id == pokerGame.currentDealer);
      firstTurn = pokerPlayers[(dealerIndex + 1) % pokerPlayers.length].id;
    }

    let currentBets: { [key: string]: { amount: number; dontAddToPot: boolean } } = {};
    for (const playerId in paymentsToTake) {
      console.log(`Setting current bet for ${playerId} to ${paymentsToTake[playerId]} (true)`);
      currentBets[playerId] = {
        amount: paymentsToTake[playerId],
        dontAddToPot: paymentsToTake[playerId] == 0 ? false : true,
      };
    }

    setPokerGame({
      ...pokerGame,
      communityCards: [EMPTY_CARD, EMPTY_CARD, EMPTY_CARD, EMPTY_CARD, EMPTY_CARD],
      currentBet: Math.max(...Object.values(paymentsToTake)),
      gameState: "PREFLOP",
      currentTurn: firstTurn,
      capturingCommunityCards: false,
      runningThroughShowdown: false,
      runningItTwice: false,
      pots: [
        {
          eligiblePlayers: Object.keys(paymentsToTake),
          amount: round(amountInPot),
          maximum: round(amountInPot),
          closed: false,
        },
      ],
      currentBets,
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
          <Alert color="red" title="Insufficient Balances" icon={<IconInfoTriangle />}>
            <Flex direction="column" gap="sm">
              Some players have insufficient balances to play the game. Please top up their balances
              before starting the game.
            </Flex>
          </Alert>
        )
      }
      <Button fullWidth mt="sm" onClick={startGame} disabled={cantStart}>
        Start Game (
        {pokerSettings.forcedBetOption == "BLINDS" &&
          `${formatMoney(pokerSettings.smallBlind, true, true)}/${formatMoney(
            pokerSettings.bigBlind,
            true,
            true
          )}`}
        {pokerSettings.forcedBetOption == "ANTE" && `${formatMoney(pokerSettings.ante, true)}`}
        {pokerSettings.forcedBetOption == "BLINDS+ANTE" &&
          `${formatMoney(pokerSettings.smallBlind, true, true)}/${formatMoney(
            pokerSettings.bigBlind,
            true,
            true
          )} + ${formatMoney(pokerSettings.ante, true, true)}`}
        )
      </Button>
      <Button
        variant="light"
        color="gray"
        mt="xs"
        fullWidth
        onClick={() => {
          let dealerIndex = Math.floor(Math.random() * pokerPlayers.length);
          setPokerGame({
            ...pokerGame,
            ...getDealerData(pokerPlayers[dealerIndex].id, pokerSettings, pokerPlayers),
          });
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
                          {(pokerSettings.forcedBetOption == "BLINDS" ||
                            pokerSettings.forcedBetOption == "BLINDS+ANTE") &&
                            pokerGame.currentSmallBlind == player.id && <SmallBlindBadge />}
                          {(pokerSettings.forcedBetOption == "BLINDS" ||
                            pokerSettings.forcedBetOption == "BLINDS+ANTE") &&
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
                                setPokerGame({
                                  ...pokerGame,
                                  ...getDealerData(player.id, pokerSettings, pokerPlayers),
                                });
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

export function AllInBadge() {
  return (
    <Tooltip label="All In" openDelay={300}>
      <Badge
        color="red"
        size="xl"
        circle
        style={{
          fontSize: "0.90rem",
          fontWeight: 700,
        }}
      >
        <Flex p={3}>
          <IconTriangleFilled />
        </Flex>
      </Badge>
    </Tooltip>
  );
}

export function DealerBadge() {
  const theme = useMantineTheme();

  return (
    <Tooltip label="Dealer" openDelay={300}>
      <Badge
        size="xl"
        circle
        style={{
          backgroundColor: theme.colors.gray[1],
          color: theme.colors.dark[6],
          fontSize: "0.70rem",
          fontWeight: 800,
          userSelect: "none",
        }}
      >
        BTN
      </Badge>
    </Tooltip>
  );
}

export function BigBlindBadge() {
  return (
    <Tooltip label="Big Blind" openDelay={300}>
      <Badge
        color="yellow"
        size="xl"
        circle
        style={{
          fontSize: "0.90rem",
          fontWeight: 700,
          userSelect: "none",
        }}
      >
        BB
      </Badge>
    </Tooltip>
  );
}

export function SmallBlindBadge() {
  return (
    <Tooltip label="Small Blind" openDelay={300}>
      <Badge
        color="blue"
        size="xl"
        circle
        style={{
          fontSize: "0.90rem",
          fontWeight: 700,
          userSelect: "none",
        }}
      >
        SB
      </Badge>
    </Tooltip>
  );
}
