import {
  Text,
  Container,
  rem,
  Card,
  SimpleGrid,
  useMantineTheme,
  darken,
  List,
  Title,
  ThemeIcon,
  CheckIcon,
  alpha,
} from "@mantine/core";

export default function ExtraFeatures() {
  const theme = useMantineTheme();

  return (
    <>
      {/* <Container my="xl">Space</Container> */}
      <Container
        id="features"
        size="lg"
        mt={45}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "30px",
        }}
      >
        <Container ta="center" mb={20}>
          <Title order={2} c="white" size={rem(45)} fw="bold">
            What Else Can{" "}
            <span
              style={{
                position: "relative",
                backgroundColor: alpha("var(--mantine-color-blue-7)", 0.4),
                borderRadius: rem(16),
                padding: `${rem(1)} ${rem(4)}`,
              }}
            >
              We
            </span>{" "}
            Do?
          </Title>
          <Text>We offer a variety of features to suit to your game management needs.</Text>
        </Container>
        <SimpleGrid
          cols={3}
          style={{
            width: "100%",
          }}
        >
          <Section title="Poker" features={["Sidebets", "Allin", "Blinds", "Ante", "Rebuys"]} />
          <Section
            title="Blackjack"
            features={[
              "21+3",
              "Perfect Pairs",
              "Bet Behind",
              "Splitting",
              "Doubling",
              "AI Voice Announcing",
            ]}
          />
          <Section title="Tracking" features={["Stuff", "Will", "Go", "Here"]} />
        </SimpleGrid>
      </Container>
    </>
  );
}

function Section({ title, features }: { title: string; features: string[] }) {
  const theme = useMantineTheme();

  return (
    <Card
      p="xl"
      style={{
        backgroundColor: darken(theme.colors.dark[6], 0.2),
        borderRadius: theme.radius.xl,
        width: "100%",
      }}
    >
      <Text c="gray.4" ta="center" size={rem(26)} fw="bold">
        {title}
      </Text>
      <List
        style={{
          width: "100%",
          color: "white",
        }}
        icon={
          <ThemeIcon color="blue" size={22} radius="xl" variant="light">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </ThemeIcon>
        }
      >
        {features.map((feature, index) => (
          <List.Item
            key={index}
            style={{
              lineHeight: 2,
            }}
          >
            <Text c="gray.3" ta="center" size="lg">
              {feature}
            </Text>
          </List.Item>
        ))}
      </List>
    </Card>
  );
}
