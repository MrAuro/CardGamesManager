import { Container, Group, Tabs, Text, rem } from "@mantine/core";
import { useState } from "react";
import { ROUTES, STATE, State } from "../App";
import { useCustomRecoilState } from "../utils/RecoilHelper";

export default function Header() {
  const [state, , modifyState] = useCustomRecoilState<State>(STATE);
  const [active, setActive] = useState(state.activeTab);

  const itemsLabel = ROUTES.map((link) => (
    <Tabs.Tab
      value={link.link}
      data-active={active === link.link || undefined}
      leftSection={link.icon}
      key={link.link}
      fw={active === link.link ? 500 : "normal"}
      onClick={(event) => {
        event.preventDefault();
        modifyState({ activeTab: link.link as any });
        setActive(link.link as any);
      }}
    >
      {link.label}
    </Tabs.Tab>
  ));

  const itemsIcon = ROUTES.map((link) => (
    <Tabs.Tab
      value={link.link}
      data-active={active === link.link || undefined}
      leftSection={link.icon}
      key={link.link}
      fw={active === link.link ? 500 : "normal"}
      onClick={(event) => {
        event.preventDefault();
        modifyState({ activeTab: link.link as any });
        setActive(link.link as any);
      }}
    />
  ));

  return (
    <header>
      <Container size="md" mt="sm">
        <Group gap={5} justify={false ? "center" : "space-between"}>
          <Text size={rem(26)} fw="bold">
            {ROUTES.find((r) => r.link === active)?.label}
          </Text>
          <Tabs variant="pills" radius="xl">
            <Tabs.List>{false ? itemsIcon : itemsLabel}</Tabs.List>
          </Tabs>
        </Group>
      </Container>
    </header>
  );
}
