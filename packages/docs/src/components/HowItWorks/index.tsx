import React from "react";
import { Container, Title, Paper, SimpleGrid, Text, rem, rgba } from "@mantine/core";

export default function HowItWorks() {
  return (
    <Container
      size="lg"
      mt={60}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "30px",
      }}
    >
      <Container ta="center">
        <Title order={2} c="white" size={rem(45)} fw="bold">
          Set Up Your Game in Minutes
        </Title>
        <Text>See how easy it is to start using Card Games Manager in three simple steps:</Text>
      </Container>
      <Section
        title="Set Up Players"
        description="Easily add and manage players in the Players tab. Create profiles, set balances, and prepare for your game in seconds."
        subtitle="Step 1"
        svg="/img/add.svg"
        side="left"
      />
      <Section
        title="Manage the Game"
        description="Navigate Blackjack or Poker with ease. Input player actions, track bets, and let the app assist with game-specific rules and calculations."
        subtitle="Step 2"
        svg="/img/track.svg"
        side="right"
      />
      <Section
        title="Celebrate Smooth Gameplay"
        description="Let the app determine winners and calculate payouts. View detailed results and updated balances for a seamless post-game experience."
        subtitle="Step 3"
        svg="/img/celebrate.svg"
        side="left"
      />
    </Container>
  );
}

function Section({
  title,
  description,
  subtitle,
  svg,
  side,
}: {
  title: string;
  description: string;
  subtitle: string;
  svg: string;
  side: "left" | "right";
}) {
  const TextContent = (
    <Container
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
      }}
      pl={side == "right" ? undefined : "45px"}
      pr={side == "left" ? undefined : "45px"}
    >
      <Text fw="bold" c="dimmed" size={rem(22)} mb="sm">
        {subtitle}
      </Text>
      <Text fw="bold" size={rem(30)} c="gray.4">
        {title}
      </Text>
      <Text c="gray.5" mt="sm">
        {description}
      </Text>
    </Container>
  );

  const ImageContent = (
    <Container
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={svg}
        alt={title}
        height="100%"
        width="100%"
        style={{
          padding: "45px",
        }}
      />
    </Container>
  );

  return (
    <Paper
      h={300}
      w="90%"
      style={{
        backgroundColor: "#151517",
      }}
      radius="xl"
    >
      <SimpleGrid cols={2} h="100%">
        {side === "left" ? TextContent : ImageContent}
        {side === "left" ? ImageContent : TextContent}
      </SimpleGrid>
    </Paper>
  );
}
