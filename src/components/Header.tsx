import { ActionIcon, Container, Flex, Group, Image, Tabs, Text, rem } from "@mantine/core";
import { PAGES, Page } from "../types/State";
import { IconCards, IconClubs, IconSettings, IconUsers } from "@tabler/icons-react";
import { useState } from "react";
import shuffle from "lodash/shuffle";

export default function Header({
  active,
  setActive,
}: {
  active: string;
  setActive: (page: Page) => void;
}) {
  const [title, setTitle] = useState("Card Games Manager");

  return (
    <Container size="md" pt="xs">
      <Group gap={5} justify={false ? "center" : "space-between"}>
        <Flex align="center" gap={5}>
          <ActionIcon
            radius={0}
            variant="transparent"
            size="lg"
            onClick={() => {
              setTitle(shuffle(title.split(" ")).join(" "));
            }}
          >
            <Image src="app-icon.png" />
          </ActionIcon>
          <Text
            size={rem(26)}
            fw="bold"
            style={{
              cursor: "default",
              userSelect: "none",
            }}
          >
            {title}
          </Text>
        </Flex>
        <Tabs variant="pills" radius="xl">
          <Tabs.List>
            {PAGES.map((page) => {
              let icon: JSX.Element;
              switch (page) {
                case "Players":
                  icon = <IconUsers size="1.4rem" />;
                  break;

                case "Blackjack":
                  icon = <IconCards size="1.4rem" />;
                  break;

                case "Poker":
                  icon = <IconClubs size="1.4rem" />;
                  break;

                case "Settings":
                  icon = <IconSettings size="1.4rem" />;
                  break;
              }

              return (
                <Tabs.Tab
                  value={page}
                  data-active={active === page || undefined}
                  key={page}
                  fw={active === page ? 500 : "normal"}
                  onClick={() => {
                    setActive(page);
                  }}
                  leftSection={icon}
                >
                  {page}
                </Tabs.Tab>
              );
            })}
          </Tabs.List>
        </Tabs>
      </Group>
    </Container>
  );
}
