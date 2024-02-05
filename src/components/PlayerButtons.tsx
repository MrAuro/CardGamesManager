import { useRecoilState } from "recoil";
import { GameState, STATE, State } from "../App";
import { Player, getNextTurnIndex } from "../utils/PokerHelper";
import { Button, Grid, Group, NumberInput } from "@mantine/core";
import { getHotkeyHandler } from "@mantine/hooks";
import { IconCurrencyDollar } from "@tabler/icons-react";

export default function PlayerButtons(props: {
  player: Player;
  turn: boolean;
  isCapturingBet: boolean;
  setIsCapturingBet: (value: boolean) => void;
  TEMP_bet: number;
  setTEMP_bet: (value: number) => void;
  placeBet: () => void;
  cancelBet: () => void;
}) {
  const [state, setState] = useRecoilState<State>(STATE);

  let buttons = null;

  // $5.50 $1.00, 50c
  const formatBlinds = (blinds: number): string => {
    if (blinds < 1) {
      return `${(blinds * 100).toFixed(0)}c`;
    } else if (blinds % 1 == 0) {
      return `$${blinds.toFixed(0)}`;
    } else {
      return `$${blinds.toFixed(2)}`;
    }
  };

  let isSB =
    state.players[state.players.indexOf(props.player)].position == "sb";
  let isBB =
    state.players[state.players.indexOf(props.player)].position == "bb";

  let anyActionThisRound = isSB || isBB;

  if (state.forcedBetType == "ANTE") anyActionThisRound = true;

  let blindsLabel = "";
  if (state.forcedBetType == "ANTE") {
    blindsLabel = "Ante";
  } else {
    if (isSB) blindsLabel = `Small Blind (${formatBlinds(state.smallBlind)})`;
    if (isBB) blindsLabel = `Big Blind (${formatBlinds(state.bigBlind)})`;
    if (!isSB && !isBB) blindsLabel = "None";
  }

  let buttonDisabled = props.turn;

  switch (state.gameState as GameState) {
    case GameState.PREROUND:
      {
        buttons = (
          <>
            <Button
              color="blue"
              disabled={!buttonDisabled}
              onClick={() => {
                let amountToBet =
                  state.forcedBetType == "ANTE"
                    ? state.ante
                    : isSB
                    ? state.smallBlind
                    : isBB
                    ? state.bigBlind
                    : 0;

                // We use the first pot since no side pot is going yet here
                let newPot = state.pots[0];

                if (newPot != undefined) {
                  newPot = {
                    ...newPot,
                    amount: newPot.amount + amountToBet,
                  };
                } else {
                  newPot = {
                    amount: amountToBet,
                    eligiblePlayerIds: state.players
                      .filter((p) => p.isPlaying)
                      .map((p) => p.id),
                  };
                }

                console.log("New Pot: ", newPot);
                console.log("TAKING ", amountToBet, " FROM ", props.player.id);

                let excludedPlayers =
                  state.forcedBetType == "ANTE"
                    ? []
                    : state.players.filter(
                        (p) => p.position == "NONE" || p.position == "btn"
                      );
                let nextTurnIndex = getNextTurnIndex(
                  state.players,
                  state.currentPlayerIndex,
                  state.dealerIndex,
                  excludedPlayers
                );

                setState({
                  ...state,
                  currentPlayerIndex: nextTurnIndex,
                  pots: [newPot],
                  players: state.players.map((p) =>
                    p.id == props.player.id
                      ? { ...p, balance: p.balance - amountToBet }
                      : p
                  ),
                  sbPaid: isSB ? true : state.sbPaid,
                  bbPaid: isBB ? true : state.bbPaid,
                  antesPaid: [...state.antesPaid, props.player.id],
                });
              }}
            >
              {!anyActionThisRound
                ? "(no action)"
                : "Take " +
                  (state.forcedBetType == "ANTE" ? "Ante" : blindsLabel)}
            </Button>
          </>
        );
      }
      break;
    case GameState.PREFLOP:
      {
        buttons = (
          <>
            <Button color="blue" disabled={false}>
              Check
            </Button>
            <Button color="red" disabled={false}>
              Fold
            </Button>
            <Button
              color="green"
              disabled={false}
              onClick={() => {
                props.setIsCapturingBet(true);
              }}
            >
              Bet
            </Button>
          </>
        );
      }
      break;
  }

  return (
    <Group grow gap="xs" justify="center">
      {props.isCapturingBet ? (
        <>
          <Grid gutter="xs">
            <Grid.Col span={{ base: 12, xs: 8 }}>
              <NumberInput
                allowNegative={false}
                autoFocus
                onKeyDown={getHotkeyHandler([
                  ["Enter", () => props.placeBet()],
                  ["Escape", () => props.cancelBet()],
                ])}
                decimalScale={2}
                fixedDecimalScale
                thousandSeparator=","
                radius="md"
                leftSection={<IconCurrencyDollar />}
                value={props.TEMP_bet}
                onChange={(value) => props.setTEMP_bet(parseFloat(`${value}`))}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, xs: 2 }}>
              <Button fullWidth color="gray" onClick={props.cancelBet}>
                Back
              </Button>
            </Grid.Col>
            <Grid.Col span={{ base: 12, xs: 2 }}>
              <Button fullWidth color="green" onClick={props.placeBet}>
                Bet
              </Button>
            </Grid.Col>
          </Grid>
        </>
      ) : (
        <>{buttons}</>
      )}
    </Group>
  );
}
