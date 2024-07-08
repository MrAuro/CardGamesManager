import { Image, Container, Title, Button, Group, Text, List, ThemeIcon, rem } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import classes from "./HeroBullets.module.css";
import React from "react";
import image from "../assets/generic.svg";

export function HeroBullets() {
  return (
    <Container size="md">
      <div className={classes.inner}>
        <div className={classes.content}>
          <Title className={classes.title}>
            Lorem <span className={classes.highlight}>ipsum</span> dolor <br /> sit amet
          </Title>
          <Text c="dimmed" mt="md">
            Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
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
              <b>Lorem</b> – ipsum dolor sit amet, consectetur adipiscing elit
            </List.Item>
            <List.Item>
              <b>Dolor</b> – sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
              any project
            </List.Item>
            <List.Item>
              <b>Consectetur</b> – adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            </List.Item>
          </List>

          <Group mt={30}>
            <Button radius="xl" size="md" className={classes.control}>
              Lorem
            </Button>
            <Button variant="default" radius="xl" size="md" className={classes.control}>
              Ipsum
            </Button>
          </Group>
        </div>
      </div>
    </Container>
  );
}
