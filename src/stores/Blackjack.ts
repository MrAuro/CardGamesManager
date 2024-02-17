import { atom } from "recoil";
import { BlackjackGame, BlackjackPlayer, BlackjackSettings } from "../types/Blackjack";

const defaultBlackjackGame: BlackjackGame = {
  gameState: "PREROUND",
  currentTurn: "",
  dealerCards: [],
  dealerFirstTime: true,
};

export const BLACKJACK_GAME_STATE = atom<BlackjackGame>({
  key: "BLACKJACK_GAME",
  default: defaultBlackjackGame,
});

const defaultBlackjackSettings: BlackjackSettings = {
  decks: 2,
  dealerHitsSoft17: true,
  doubleAfterSplit: true,
  splitAces: true,
  splitAcesReceiveOneCard: true,

  blackjackPayout: 3 / 2,

  twentyOnePlusThreeEnabled: false,
  twentyOnePlusThreeFlushPayout: 5,
  twentyOnePlusThreeStraightPayout: 10,
  twentyOnePlusThreeThreeOfAKindPayout: 30,
  twentyOnePlusThreeStraightFlushPayout: 40,
  twentyOnePlusThreeThreeOfAKindSuitedPayout: 100,

  perfectPairsEnabled: false,
  perfectPairsMixedPayout: 6,
  perfectPairsColoredPayout: 12,
  perfectPairsSuitedPayout: 30,

  betBehindEnabled: false,
};

export const BLACKJACK_SETTINGS_STATE = atom<BlackjackSettings>({
  key: "BLACKJACK_GAME",
  default: defaultBlackjackSettings,
});

export const BLACKJACK_PLAYERS_STATE = atom<BlackjackPlayer[]>({
  key: "BLACKJACK_PLAYERS",
  default: [],
});
