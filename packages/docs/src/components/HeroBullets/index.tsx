import {
  Container,
  Grid,
  Title,
  alpha,
  rem,
  useMantineTheme,
  Text,
  Divider,
  List,
  ThemeIcon,
} from "@mantine/core";

import styles from "./styles.module.css";

const Svg = require("@site/static/img/hero-main.svg").default;

export function HeroBullets() {
  const theme = useMantineTheme();

  return (
    <Container size="lg" mt={120}>
      <Grid grow gutter="xl">
        <Grid.Col
          span={7}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Title
            c="white"
            size={rem(50)}
            style={{
              fontFamily: "Comfortaa, Nunito, sans-serif",
            }}
          >
            Deal With{" "}
            <span
              style={{
                position: "relative",
                backgroundColor: alpha("var(--mantine-color-blue-7)", 0.6),
                borderRadius: rem(16),
                padding: `${rem(4)} ${rem(4)}`,
              }}
            >
              {/* Makes the fi in Confidence not so close together */}
              Con<span style={{ letterSpacing: "0.1px" }}>f</span>idence
            </span>{" "}
            <br /> Not Chaos
          </Title>
          <Text size="md">
            Streamline your game management with CardGamesManager. Effortlessly manage your
            Blackjack and Poker games with a few clicks and ensure a smooth gaming experience.
          </Text>
          <List
            mt={30}
            spacing="sm"
            size="sm"
            icon={
              <ThemeIcon size={24} radius="xl">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </ThemeIcon>
            }
          >
            <List.Item>
              <b>Real-Time Balances</b> – Keep track of your players' balances effortlessly with
              instant updates
            </List.Item>
            <List.Item>
              <b>Customizable Settings</b> – Tailor your game and app settings to your liking with
              powerful customization options
            </List.Item>
            <List.Item>
              <b>Advanced Bet Management</b> – Manage bets, sidepots, and more with ease and
              confidence, all in one place
            </List.Item>
          </List>
        </Grid.Col>
        <Grid.Col
          span={5}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <object type="image/svg+xml" data="/img/hero-main.svg"></object>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
