import { BlackjackPlayer, BlackjackSettings } from "@/types/Blackjack";
import { Player } from "@/types/Player";

export function getPlayer(id: string, players: Player[]): Player | undefined {
  return players.find((p) => p.id === id);
}

export function getPlayerErrors(
  balance: number,
  settings: BlackjackSettings,
  bets: {
    bet: number;
    twentyOnePlusThree: number;
    perfectPairs: number;
    betBehindBet: number;
    betBehindTarget: string | null;
  }
): string[] {
  // Rather than passing the the player and blackjackPlayer objects,
  // we pass in the balance and a flattened bets object
  // This is done to prevent the state from being one behind
  // (due to the new bet being saved after the errors are calculated)

  const errors: string[] = [];

  let totalBet = 0;
  if (bets.bet < 0) errors.push("Invalid bet amount");
  totalBet += bets.bet;

  if (settings.twentyOnePlusThreeEnabled && bets.twentyOnePlusThree > 0) {
    if (bets.twentyOnePlusThree < 0) errors.push("Invalid 21+3 bet amount");
    totalBet += bets.twentyOnePlusThree;
  }

  if (settings.perfectPairsEnabled && bets.perfectPairs > 0) {
    if (bets.perfectPairs < 0) errors.push("Invalid perfect pairs bet amount");
    totalBet += bets.perfectPairs;
  }

  if (settings.betBehindEnabled) {
    if (bets.betBehindBet < 0) errors.push("Invalid bet behind amount");
    totalBet += bets.betBehindBet;

    if (!bets.betBehindTarget && bets.betBehindBet > 0) {
      errors.push("Invalid bet behind target");
    }
  }

  if (totalBet > balance) {
    errors.push("Insufficient funds");
  }

  return errors;
}
