// Types are from https://github.com/xpressit/winning-poker-hand-rank/

export type HandRank = {
  rank: number;
  combination: Combination;
  madeHand: [PlayingCard, PlayingCard, PlayingCard, PlayingCard, PlayingCard];
  unused: PlayingCard[];
  low?: {
    rank: number;
    madeHand: [PlayingCard, PlayingCard, PlayingCard, PlayingCard, PlayingCard];
  };
};

export type Combination =
  | "RoyalFlush"
  | "StraightFlush"
  | "FourOfAKind"
  | "FullHouse"
  | "Flush"
  | "Straight"
  | "ThreeOfAKind"
  | "TwoPair"
  | "Pair"
  | "HighCard"
  | "Nothing"
  | "Invalid";

export type PlayingCard =
  | "AC"
  | "AS"
  | "AD"
  | "AH"
  | "KC"
  | "KS"
  | "KD"
  | "KH"
  | "QC"
  | "QS"
  | "QD"
  | "QH"
  | "JC"
  | "JS"
  | "JD"
  | "JH"
  | "TC"
  | "TS"
  | "TD"
  | "TH"
  | "9C"
  | "9S"
  | "9D"
  | "9H"
  | "8C"
  | "8S"
  | "8D"
  | "8H"
  | "7C"
  | "7S"
  | "7D"
  | "7H"
  | "6C"
  | "6S"
  | "6D"
  | "6H"
  | "4C"
  | "4S"
  | "4D"
  | "4H"
  | "3C"
  | "3S"
  | "3D"
  | "3H"
  | "2C"
  | "2S"
  | "2D"
  | "2H"
  | "5C"
  | "5S"
  | "5D"
  | "5H";
