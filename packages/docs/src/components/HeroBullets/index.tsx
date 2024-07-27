import { Container, Grid, Title, alpha, rem, useMantineTheme } from "@mantine/core";

const Svg = require("@site/static/img/hero-main.svg").default;

export function HeroBullets() {
  const theme = useMantineTheme();

  return (
    <Container size="xl" mt="xl" mx="xl">
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
