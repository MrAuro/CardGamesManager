import { Card, Container, Grid, Image, Title, Text, CardSection, Divider } from "@mantine/core";

type FeatureItem = {
  title: string;
  Svg: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Poker Game Management",
    Svg: "/img/poker.svg",
    description: (
      <>
        Keep your poker games organized and fair with detailed hand descriptions and accurate
        tracking. Never lose track of bets and sidepots again.
      </>
    ),
  },
  {
    title: "Blackjack Dealer Assistance",
    Svg: "/img/blackjack.svg",
    description: (
      <>
        Get real-time dealer instructions, automatic payout calculations, and sidebet management.
        Make your blackjack games run smoother than ever.
      </>
    ),
  },
  {
    title: "AI Card Recognition",
    Svg: "/img/ai_card_recognition.svg",
    description: (
      <>
        Leverage advanced AI to recognize cards and suits instantly, reducing manual input and
        potential errors. Speed up your game management.
      </>
    ),
  },
];

export default function Features() {
  return (
    <Container size="lg" mt={120}>
      <Grid>
        {FeatureList.map((feature, index) => (
          <Grid.Col span={4} key={index}>
            <Card
              style={{
                width: "100%",
                height: "100%",
              }}
            >
              <img
                src={feature.Svg}
                alt={feature.title}
                height="200px"
                width="200px"
                style={{
                  display: "block",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              />

              <Title order={4} ta="center" c="gray.3" mt="sm">
                {feature.title}
              </Title>
              <Text ta="center" fw="light" size="md">
                {feature.description}
              </Text>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
}
