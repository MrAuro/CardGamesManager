import { Container, Group, Tabs, Title, useMantineTheme } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import { ROUTES, STATE } from "../App";
import { useElementSize, useViewportSize } from "@mantine/hooks";

export default function Header() {
  const [state, setState] = useRecoilState(STATE);
  const [active, setActive] = useState(state.activeTab);

  const tabsSize = useElementSize();
  const titleSize = useElementSize();

  const { width } = useViewportSize();
  const showTitle = width < tabsSize.width + titleSize.width + 100;

  const items = ROUTES.map((link) => (
    <Tabs.Tab
      value={link.link}
      data-active={active === link.link || undefined}
      leftSection={link.icon}
      key={link.link}
      fw={active === link.link ? 500 : "normal"}
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
        <Group gap={5} justify={showTitle ? "center" : "space-between"}>
          {!showTitle && (
            <Title order={1} ref={titleSize.ref}>
              {ROUTES.find((r) => r.link === active)?.label}
            </Title>
          )}
          <Tabs variant="pills" ref={tabsSize.ref}>
            <Tabs.List>{items}</Tabs.List>
          </Tabs>
        </Group>
      </Container>
    </header>
  );
}
