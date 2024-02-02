import { Burger, Container, Group, Tabs, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { ROUTES, STATE, STATE_WATCHER, State } from "../App";

export function Header() {
  const [opened, { toggle }] = useDisclosure(false);
  const [state, setState] = useRecoilState(STATE);
  const val = useRecoilValue<State>(STATE_WATCHER);
  const [active, setActive] = useState(val.activeTab);

  const items = ROUTES.map((link) => (
    <Tabs.Tab
      value={link.link}
      data-active={active === link.link || undefined}
      leftSection={link.icon}
      onClick={(event) => {
        event.preventDefault();
        setState({ ...state, activeTab: link.link });
        setActive(link.link);
      }}
    >
      {link.label}
    </Tabs.Tab>
  ));

  return (
    <header>
      <Container size="md" mt="sm">
        <Group gap={5} visibleFrom="xs" justify="space-between">
          <Title order={1}>
            {ROUTES.find((r) => r.link === active)?.label}
          </Title>
          <Tabs variant="pills">
            <Tabs.List>{items}</Tabs.List>
          </Tabs>
        </Group>

        <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
      </Container>
    </header>
  );
}
