import {
  Card,
  Container,
  Grid,
  Image,
  Title,
  Text,
  CardSection,
  Divider,
  HoverCard,
  useMantineTheme,
  darken,
} from "@mantine/core";
import { TiltCard } from "../HoverCard";

import { motion } from "framer-motion";

type FeatureItem = {
  title: string;
  Svg: string;
  description: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Poker Game Management",
    Svg: "/img/poker.svg",
    description:
      "Keep your poker games organized and fair with detailed hand descriptions and tracking. Never lose track of bets and sidepots again.",
  },
  {
    title: "Blackjack Dealer Assistance",
    Svg: "/img/blackjack.svg",
    description:
      "Get real-time dealer instructions, automatic payout calculations, and sidebet management. Make your blackjack games run smoother than ever.",
  },
  {
    title: "AI Card Recognition",
    Svg: "/img/ai_card_recognition.svg",
    description:
      "Leverage advanced AI to recognize cards and suits instantly, reducing manual input and potential errors. Speed up your game management.",
  },
];

export default function Features() {
  const theme = useMantineTheme();

  return (
    <Container size="lg" mt={120}>
      <Grid>
        {FeatureList.map((feature, index) => (
          <Grid.Col span={4} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 + index * 0.2 }}
            >
              <TiltCard feature={feature} />
            </motion.div>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
}
