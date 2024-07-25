import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";

import "../css/custom.css";
import "@mantine/core/styles.css";
import {
  ActionIcon,
  AppShell,
  Button,
  Container,
  createTheme,
  Flex,
  Group,
  Image,
  MantineProvider,
  rgba,
  ScrollArea,
  Text,
  Title,
  useMatches,
} from "@mantine/core";
import { useMediaQuery, useWindowScroll } from "@mantine/hooks";

// function HomepageHeader() {
//   const { siteConfig } = useDocusaurusContext();
//   return (
//     <header className={clsx("hero hero--primary", styles.heroBanner)}>
//       <div className="container">
//         <Heading as="h1" className="hero__title">
//           {siteConfig.title}
//         </Heading>
//         <p className="hero__subtitle">{siteConfig.tagline}</p>
//         <div className={styles.buttons}>
//           <Link className="button button--secondary button--lg" to="/docs/intro">
//             Docusaurus Tutorial - 5min ⏱️
//           </Link>
//         </div>
//       </div>
//     </header>
//   );
// }

const HeroSvg: React.ComponentType<React.ComponentProps<"svg">> =
  require("@site/static/img/hero-main.svg").default;

const theme = createTheme({
  fontFamily: "Nunito, serif",
  colors: {
    dark: [
      "#A9A9A0",
      "#8E8F93",
      "#787D82",
      "#43474E",
      "#2C2F34",
      "#1F2025",
      "#1A1A1D",
      "#121315",
      "#0B0C0D",
      "#080909",
    ],
  },
  defaultRadius: "lg",
});

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const [scroll] = useWindowScroll();

  return (
    <MantineProvider forceColorScheme="dark" theme={theme}>
      <AppShell
        header={{
          height: 60,
        }}
        style={{
          backgroundColor: theme.colors.dark[7],
        }}
      >
        <AppShell.Header
          style={{
            backgroundColor: rgba(theme.colors.dark[7], Math.min(scroll.y / 100, 0.9)),
            backdropFilter: "blur(2px)",

            // Smoothly fade in/out border color on scroll
            borderBottom: "1px solid",
            borderColor: `rgba(255, 255, 255, ${Math.min(scroll.y / 100, 0.15)})`,
            transition: "border-color 0.3s ease",
          }}
        >
          <Container h="100%" size="xl">
            <Flex align="center" justify="space-between" w="100%" h="100%">
              <Flex align="center" flex={1}>
                <Image src="/img/logo.png" alt="CardGamesManager" width={35} height={35} mr={5} />
                <Title order={1} c="gray.1" size="1.5rem" fw={700}>
                  CardGamesManager
                </Title>
              </Flex>

              <Flex gap="lg" align="center" justify="center" flex={1}>
                <Text>Pricing</Text>
                <Text>Docs</Text>
              </Flex>

              <Flex align="center" gap="sm" flex={1} justify="flex-end">
                <ActionIcon
                  variant="transparent"
                  radius={0}
                  size="lg"
                  component="a"
                  href="https://discord.gg/ZHqpuszdaM"
                  target="_blank"
                >
                  <Image src="/img/discord-mark-white.svg" alt="Discord" width={20} height={20} />
                </ActionIcon>
                <ActionIcon
                  variant="transparent"
                  radius={0}
                  size="lg"
                  component="a"
                  href="https://github.com/mrauro/cardgamesmanager"
                  target="_blank"
                >
                  <Image src="/img/github-mark-white.svg" alt="GitHub" width={25} height={25} />
                </ActionIcon>
              </Flex>
            </Flex>
          </Container>
        </AppShell.Header>
        <AppShell.Main>
          <Container size="xl">
            {[...Array(100)].map((_, index) => (
              <Text key={index}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
            ))}
          </Container>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}
