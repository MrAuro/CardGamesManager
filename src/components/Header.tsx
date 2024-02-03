import { Container, Group, Tabs, Title, useMantineTheme } from "@mantine/core";
import { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { ROUTES, STATE, STATE_WATCHER, State } from "../App";
import { useMediaQuery } from "@mantine/hooks";

export default function Header() {
  const [state, setState] = useRecoilState(STATE);
  const val = useRecoilValue<State>(STATE_WATCHER);
  const [active, setActive] = useState(val.activeTab);
  const theme = useMantineTheme();

  const size = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`);

  const items = ROUTES.map((link) => (
    <Tabs.Tab
      value={link.link}
      data-active={active === link.link || undefined}
      leftSection={link.icon}
      key={link.link}
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
        <Group gap={5} justify={size ? "center" : "space-between"}>
          {!size && (
            <Title order={1}>
              {ROUTES.find((r) => r.link === active)?.label}
            </Title>
          )}
          <Tabs variant="pills">
            <Tabs.List>{items}</Tabs.List>
          </Tabs>
        </Group>
      </Container>
    </header>
  );
}
