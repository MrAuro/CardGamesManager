import { BLACKJACK_SETTINGS, BLACKJACK_PLAYERS_STATE, BLACKJACK_GAME_STATE } from "@/Root";
import PlayingCard from "@/components/PlayingCard";
import { useRecoilImmerState } from "@/utils/RecoilImmer";
import { Card, useMantineTheme, Group, Text } from "@mantine/core";
import { useRecoilState } from "recoil";
import DealerItem from "../components/DealerItem";
import GenericCard from "@/components/GenericPlayerCard";
import GenericPlayerCard from "@/components/GenericPlayerCard";

export default function Round() {
  const theme = useMantineTheme();
  const [blackjackSettings] = useRecoilState(BLACKJACK_SETTINGS);
  const [blackjackPlayers, setBlackjackPlayers] = useRecoilImmerState(BLACKJACK_PLAYERS_STATE);
  const [blackjackGame, setBlackjackGame] = useRecoilState(BLACKJACK_GAME_STATE);

  return (
    <>
      <DealerItem cards={blackjackGame.dealerCards} />
    </>
  );
}
