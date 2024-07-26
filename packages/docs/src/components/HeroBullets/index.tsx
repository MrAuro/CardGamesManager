import { Image, Container, Title, Button, Group, Text, List, ThemeIcon, rem } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import classes from "./styles.module.css";

const Svg = require("@site/static/img/hero-main.svg").default;

export function HeroBullets() {
  return (
    <Container size="lg">
      <div className={classes.inner}>
        <div className={classes.content}>
          <Title c="white" fw={800} size={rem(50)}>
            Deal With <span className={classes.highlight}>Confidence</span> <br /> Not Chaos
          </Title>
          <Text c="dimmed" mt="md">
            Build fully functional accessible web applications faster than ever – Mantine includes
            more than 120 customizable components and hooks to cover you in any situation
          </Text>

          <List
            mt={30}
            spacing="sm"
            size="sm"
            icon={
              <ThemeIcon size={20} radius="xl">
                <IconCheck style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
              </ThemeIcon>
            }
          >
            <List.Item>
              <b>TypeScript based</b> – build type safe applications, all components and hooks
              export types
            </List.Item>
            <List.Item>
              <b>Free and open source</b> – all packages have MIT license, you can use Mantine in
              any project
            </List.Item>
            <List.Item>
              <b>No annoying focus ring</b> – focus ring will appear only when user navigates with
              keyboard
            </List.Item>
          </List>

          <Group mt={30}>
            <Button radius="xl" size="md" className={classes.control}>
              Get started
            </Button>
            <Button variant="default" radius="xl" size="md" className={classes.control}>
              Source code
            </Button>
          </Group>
        </div>
        <Image src={"/img/hero-main.svg"} visibleFrom="md" width="376px" height="376px" />
      </div>
    </Container>
  );
}
