import { Container, Group, Tabs, Text, rem } from "@mantine/core";
import { PAGES, Page } from "../types/State";
import { IconCards, IconClubs, IconSettings, IconUsers } from "@tabler/icons-react";

export default function Header({
  active,
  setActive,
}: {
  active: string;
  setActive: (page: Page) => void;
}) {
  return (
    <Container size="md" mt="sm">
      <Group gap={5} justify={false ? "center" : "space-between"}>
        <Text size={rem(26)} fw="bold">
          {active}
        </Text>
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
