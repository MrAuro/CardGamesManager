declare module "blackjack-strategy" {
  interface Options {
    hitSoft17: boolean;
    surrender: "none" | "late" | "early";
    double: "none" | "10or11" | "9or10or11" | "any";
    doubleRange?: [number, number];
    doubleAfterSplit: boolean;
    resplitAces: boolean;
    offerInsurance: boolean;
    numberOfDecks: number;
    maxSplitHands: number;
    count: {
      system: "HiLo" | null;
      trueCount: number | null;
    };
    strategyComplexity:
      | "easy"
      | "simple"
      | "advanced"
      | "exactComposition"
      | "bjc-supereasy"
      | "bjc-simple"
      | "bjc-great";
  }

  type PlayerAction =
    | "hit"
    | "stand"
    | "split"
    | "double"
    | "surrender"
    | "splitOrHit"
    | "splitOrStand";

  function GetRecommendedPlayerAction(
    playerCards: number[],
    dealerCard: number,
    handCount: number,
    dealerCheckedBlackjack: boolean,
    options: Options | null
  ): PlayerAction;
}
