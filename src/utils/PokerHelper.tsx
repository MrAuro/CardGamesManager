import {
  IconHeartFilled,
  IconDiamondsFilled,
  IconClubsFilled,
  IconSpadeFilled,
} from "@tabler/icons-react";

type Card = {
  suit: CardSuit;
  rank: CardRank;
};

type CardSuit = "hearts" | "diamonds" | "clubs" | "spades" | "NONE";
type CardRank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "T"
  | "J"
  | "Q"
  | "K"
  | "A"
  | "NONE";

type Player = {
  id: string;
  name: string;
  cards: [Card, Card];
  balance: number;
  position: PlayerPosition;
  isPlaying: boolean;
};

type PlayerPosition = "sb" | "bb" | "btn" | "NONE";

const suitToName = (suit: CardSuit) => {
  switch (suit) {
    case "hearts":
      return "Hearts";
    case "diamonds":
      return "Diamonds";
    case "clubs":
      return "Clubs";
    case "spades":
      return "Spades";
    default:
      return "";
  }
};

const rankToName = (rank: CardRank) => {
  switch (rank) {
    case "2":
      return "Two";
    case "3":
      return "Three";
    case "4":
      return "Four";
    case "5":
      return "Five";
    case "6":
      return "Six";
    case "7":
      return "Seven";
    case "8":
      return "Eight";
    case "9":
      return "Nine";
    case "T":
      return "Ten";
    case "J":
      return "Jack";
    case "Q":
      return "Queen";
    case "K":
      return "King";
    case "A":
      return "Ace";
    default:
      return "";
  }
};

type PlayerResult = {
  handRank: string | null;
  hand: string | null;
  ties: number;
  tiesPercentage: string;
  win: number;
  winPercentage: string;
};

type StoredPlayerResult = {
  id: string;
  result: PlayerResult;
};

const cardToString = (card: Card) => {
  if (card.rank == "NONE" || card.suit == "NONE") {
    return "NONE";
  }
  return `${card.rank}${card.suit[0]}`;
};

const suitToIcon = (name: string): React.ReactNode => {
  let size = "1.7rem";

  switch (name) {
    case "hearts":
      return <IconHeartFilled size={size} />;
    case "diamonds":
      return <IconDiamondsFilled size={size} />;
    case "clubs":
      return <IconClubsFilled size={size} />;
    case "spades":
      return <IconSpadeFilled size={size} />;
  }
};

const suitToEmoji = (name: string): string => {
  return name
    .replace(/H/gi, "♥️")
    .replace(/D/gi, "♦️")
    .replace(/C/gi, "♣️")
    .replace(/S/gi, "♠️");
};

// 2h7c to [{suit: "hearts", rank: "2"}, {suit: "clubs", rank: "7"}]
const joinedStringToCards = (cards: string | null): Card[] => {
  if (!cards) {
    return [];
  }

  let result: Card[] = [];
  for (let i = 0; i < cards.length; i += 2) {
    result.push({
      suit: suitAbbreviationToName(cards[i + 1]),
      rank: cards[i] as CardRank,
    });
  }

  return result;
};

const isCardEmpty = (card: Card) => {
  return card.rank == "NONE" || card.suit == "NONE";
};

const suitAbbreviationToName = (abbr: string): CardSuit => {
  switch (abbr) {
    case "h":
      return "hearts";
    case "d":
      return "diamonds";
    case "c":
      return "clubs";
    case "s":
      return "spades";
    default:
      return "NONE";
  }
};

const rankingToName = (rank: string): string => {
  switch (rank) {
    case "ROYAL_FLUSH":
      return "Royal Flush";
    case "STRAIGHT_FLUSH":
      return "Straight Flush";
    case "QUADS":
      return "Quads";
    case "FULL_HOUSE":
      return "Full House";
    case "FLUSH":
      return "Flush";
    case "STRAIGHT":
      return "Straight";
    case "THREE_OF_A_KIND":
      return "Three of a Kind";
    case "TWO_PAIRS":
      return "Two Pairs";
    case "ONE_PAIR":
      return "One Pair";
    case "HIGH_CARDS":
      return "High Cards";
    default:
      return "";
  }
};

const getNextTurnIndex = (
  players: Player[],
  currentPlayerIndex: number,
  dealerIndex: number,
  excludePlayers: Player[] = []
): number => {
  let res = -1;
  for (
    let i = currentPlayerIndex + 1;
    i < players.length * 2 + dealerIndex + 1;
    i++
  ) {
    let index = i % players.length;
    if (players[index].isPlaying && !excludePlayers.includes(players[index])) {
      res = index;
      break;
    }
  }

  console.log("getNextTurnIndex", res);

  return res;
};

const EMPTY_CARD: Card = { suit: "NONE", rank: "NONE" };

export {
  suitToName,
  rankToName,
  cardToString,
  suitToIcon,
  suitToEmoji,
  joinedStringToCards,
  isCardEmpty,
  suitAbbreviationToName,
  rankingToName,
  getNextTurnIndex,
  EMPTY_CARD,
};
export type {
  Card,
  CardSuit,
  CardRank,
  Player,
  PlayerPosition,
  PlayerResult,
  StoredPlayerResult,
};
