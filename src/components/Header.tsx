import { Container, Group, Tabs, Title } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { useState } from "react";
import { atom, useRecoilState } from "recoil";
import { ROUTES, STATE } from "../App";

const FULL_TAB_WIDTH = atom({
  key: "SIZE_STATE",
  default: 0,
});

export default function Header() {
  const [state, setState] = useRecoilState(STATE);
  const [active, setActive] = useState(state.activeTab);
  const [fullTabWidth, setfullTabWidth] = useRecoilState(FULL_TAB_WIDTH);

  const fullTabsSize = useElementSize();
  const titleSize = useElementSize();
  const containerSize = useElementSize();

  if (fullTabWidth < fullTabsSize.width && fullTabsSize.width > 0) {
    setfullTabWidth(fullTabsSize.width);
  }

  const showTitle =
    containerSize.width - titleSize.width - fullTabWidth - 20 < 0;

  const iconsOnly = containerSize.width < fullTabWidth;

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
      {iconsOnly ? null : link.label}
    </Tabs.Tab>
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
          <Tabs variant="pills" ref={fullTabsSize.ref}>
            <Tabs.List>{items}</Tabs.List>
          </Tabs>
        </Group>
      </Container>
    </header>
  );
}
