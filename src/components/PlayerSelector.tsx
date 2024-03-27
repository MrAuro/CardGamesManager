import {
  BLACKJACK_PLAYERS_STATE,
  PLAYERS_STATE,
  POKER_GAME_STATE,
  POKER_PLAYERS_STATE,
} from "@/Root";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { BlackjackPlayer } from "@/types/Blackjack";
import { Player } from "@/types/Player";
import { formatMoney } from "@/utils/MoneyHelper";
import { getPlayer } from "@/utils/PlayerHelper";
import { useRecoilImmerState } from "@/utils/RecoilImmer";
import { Select, Text } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { PokerPlayer } from "@/types/Poker";
import { useRecoilState } from "recoil";
import shuffle from "lodash/shuffle";

type PropsType = {
  game: "BLACKJACK" | "POKER";
  playerElement: (
    index: number,
    player: Player,
    removePlayer: (id: string) => void,
    blackjackPlayer?: BlackjackPlayer,
    pokerPlayer?: PokerPlayer
  ) => JSX.Element;
};

export interface PlayerSelectorHandles {
  shuffleListState: () => void;
}

const PlayerSelector = forwardRef<PlayerSelectorHandles, PropsType>(
  ({ game, playerElement }, ref) => {
    const [players] = useRecoilImmerState(PLAYERS_STATE);

    const [blackjackPlayers, setBlackjackPlayers] = useRecoilImmerState(BLACKJACK_PLAYERS_STATE);
    const [pokerPlayers, setPokerPlayers] = useRecoilImmerState(POKER_PLAYERS_STATE);
    const [pokerGame, setPokerGame] = useRecoilState(POKER_GAME_STATE);

    const [listState, handlers] = useListState<string>(
      game == "BLACKJACK"
        ? blackjackPlayers.map((player) => player.id)
        : pokerPlayers.map((player) => player.id)
    );

    useImperativeHandle(ref, () => ({
      shuffleListState() {
        handlers.setState(shuffle(listState));
      },
    }));

    const removePlayer = (id: string) => {
      handlers.filter((playerId) => playerId !== id);
    };

    useEffect(() => {
      if (game == "BLACKJACK") {
        let orderedPlayers = listState.map((id) => blackjackPlayers.find((p) => p.id === id)!);
        orderedPlayers = orderedPlayers.filter((p) => p != undefined);
        setBlackjackPlayers(orderedPlayers);
      } else if (game == "POKER") {
        let orderedPlayers = listState.map((id) => pokerPlayers.find((p) => p.id === id)!);
        orderedPlayers = orderedPlayers.filter((p) => p != undefined);
        setPokerPlayers(orderedPlayers);

        let dealerIndex = orderedPlayers.findIndex(
          (player) => player.id == pokerGame.currentDealer
        );
        if (dealerIndex == -1) return;
        let sbIndex = (dealerIndex + 1) % orderedPlayers.length;
        let bbIndex = (dealerIndex + 2) % orderedPlayers.length;

        setPokerGame({
          ...pokerGame,
          currentSmallBlind: orderedPlayers[sbIndex].id,
          currentBigBlind: orderedPlayers[bbIndex].id,
        });
      }
    }, [listState]);

    // Immediately clears the selection
    // https://discord.com/channels/854810300876062770/1202574436516237323/1202575107290304522 (Mantine Discord)
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>();
    useEffect(() => {
      setSelectedPlayer(null);
    }, [selectedPlayer]);

    return (
      <>
        <Select
          key={selectedPlayer}
          placeholder="Add Player"
          leftSectionPointerEvents="none"
          leftSection={<IconSearch size="1.25rem" />}
          clearable
          searchable
          radius="md"
          mb="sm"
          value={selectedPlayer}
          data={players
            .filter((player) => !listState.includes(player.id))
            .map((player) => ({
              value: player.id,
              label: `${player.name} (${formatMoney(player.balance)})`,
            }))}
          onChange={(_value, option) => {
            setSelectedPlayer(option.value);
            let player = getPlayer(option.value, players);
            if (!player) return console.error("Player not found");

            if (game == "BLACKJACK") {
              setBlackjackPlayers((draft) => {
                draft.push({
                  id: player!.id,
                  bet: 0,
                  cards: [],
                  displayName: player!.name,
                  doubledDown: false,
                  errors: [],
                  sidebets: {
                    betBehind: {
                      bet: 0,
                      target: null,
                    },
                    perfectPairs: 0,
                    twentyOnePlusThree: 0,
                  },
                  split: false,
                });
              });
            } else {
              setPokerPlayers((draft) => {
                draft.push({
                  id: player!.id,
                  allIn: false,
                  cards: [],
                  currentBet: 0,
                  displayName: player!.name,
                  folded: false,
                  beenOn: false,
                });
              });
            }
            handlers.append(option.value);
          }}
        />
        {game == "BLACKJACK" && blackjackPlayers.length < 1 && (
          <Text ta="center" size="md" fw="bold">
            No players added
          </Text>
        )}
        {game == "POKER" && pokerPlayers.length < 1 && (
          <Text ta="center" size="md" fw="bold">
            No players added
          </Text>
        )}
        <DragDropContext
          onDragEnd={({ destination, source }) => {
            handlers.reorder({
              from: source.index,
              to: destination?.index || 0,
            });
          }}
        >
          <Droppable droppableId="players" direction="vertical">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {listState.map((id, index) => {
                  if (game == "BLACKJACK") {
                    return playerElement(
                      index,
                      getPlayer(
                        blackjackPlayers.find((player) => player.id == id)?.splitFrom || id,
                        players
                      )!,
                      removePlayer,
                      blackjackPlayers.find((player) => player.id == id)
                    );
                  } else if (game == "POKER") {
                    return playerElement(
                      index,
                      getPlayer(id, players)!,
                      removePlayer,
                      undefined,
                      pokerPlayers.find((player) => player.id == id)
                    );
                  }
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </>
    );
  }
);

export default PlayerSelector;
