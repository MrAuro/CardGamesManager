import { Container, Group, Tabs, Title } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { useState } from "react";
import { ROUTES, STATE, State } from "../App";
import { useCustomRecoilState } from "../utils/Recoil";

export default function Header() {
  const [state, setState, modifyState] = useCustomRecoilState<State>(STATE);
  const [active, setActive] = useState(state.activeTab);

  const fullTabsSize = useElementSize();
  const titleSize = useElementSize();
  const containerSize = useElementSize();

  if (state.fullTabWidth < fullTabsSize.width && fullTabsSize.width > 0) {
    modifyState({ fullTabWidth: fullTabsSize.width });
  }

  const showTitle =
    containerSize.width - titleSize.width - state.fullTabWidth - 20 < 0;

  const iconsOnly = containerSize.width < state.fullTabWidth;

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
      <Container size="md" mt="sm" ref={containerSize.ref}>
        <Group gap={5} justify={showTitle ? "center" : "space-between"}>
          {!showTitle && (
            <Title order={1} ref={titleSize.ref}>
              {ROUTES.find((r) => r.link === active)?.label}
            </Title>
          )}
          <Tabs variant="pills" ref={fullTabsSize.ref} radius="xl">
            <Tabs.List>{iconsOnly ? itemsIcon : itemsLabel}</Tabs.List>
          </Tabs>
        </Group>
      </Container>
    </header>
  );
}
