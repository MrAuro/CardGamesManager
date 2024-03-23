import {
  KEYBINDINGS_STATE,
  PLAYERS_STATE,
  POKER_GAME_STATE,
  POKER_PLAYERS_STATE,
  POKER_SETTINGS_STATE,
} from "@/Root";
import GenericPlayerCard from "@/components/GenericPlayerCard";
import PlayerSelector from "@/components/PlayerSelector";
import { formatMoney } from "@/utils/MoneyHelper";
import { useRecoilImmerState } from "@/utils/RecoilImmer";
import { Draggable, DraggableStateSnapshot } from "@hello-pangea/dnd";
import {
  Badge,
  Button,
  ButtonGroup,
  Divider,
  Flex,
  Title,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { IconTarget, IconX } from "@tabler/icons-react";
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
  const [pokerPlayers] = useRecoilImmerState(POKER_PLAYERS_STATE);
  const [players] = useRecoilImmerState(PLAYERS_STATE);
  const [keybindings] = useRecoilImmerState(KEYBINDINGS_STATE);

  const setDealer = (playerId: string) => {
    let playerIndex = pokerPlayers.findIndex((player) => player.id == playerId);
    if (playerIndex == -1) return;

    let sbIndex = (playerIndex + 1) % pokerPlayers.length;
    let bbIndex = (playerIndex + 2) % pokerPlayers.length;

    setPokerGame({
      ...pokerGame,
      currentDealer: playerId,
      currentSmallBlind: pokerPlayers[sbIndex].id,
      currentBigBlind: pokerPlayers[bbIndex].id,
    });
  };

  return (
    <>
      <Button fullWidth mt="sm">
        Start Game
      </Button>
      <Divider my="md" />
      <Title order={2} mb="sm">
        Players
      </Title>
      <PlayerSelector
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
                          {pokerGame.currentSmallBlind == player.id && <SmallBlindBadge />}
                          {pokerGame.currentBigBlind == player.id && <BigBlindBadge />}
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
                              onClick={() => {
                                setDealer(player.id);
                              }}
                            >
                              <IconTarget size="1.25rem" />
                            </Button>
                          </Tooltip>
                          <Button
                            fullWidth
                            variant="light"
                            color="red"
                            onClick={() => {
                              removePlayer(player.id);
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

function DealerBadge() {
  return (
    <Badge color="gray" size="lg">
      BTN
    </Badge>
  );
}

function BigBlindBadge() {
  return (
    <Badge color="yellow" size="lg">
      BB
    </Badge>
  );
}

function SmallBlindBadge() {
  return (
    <Badge color="blue" size="lg">
      SB
    </Badge>
  );
}
