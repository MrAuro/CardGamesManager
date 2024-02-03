import {
  Button,
  Container,
  Input,
  InputWrapper,
  Slider,
  Space,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { useRecoilState, useRecoilValue } from "recoil";
import { STATE, State, STATE_WATCHER } from "../App";
import { IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";

export default function Settings() {
  const [state, setState] = useRecoilState(STATE);
  const val = useRecoilValue<State>(STATE_WATCHER);
  const theme = useMantineTheme();
  const { setColorScheme, colorScheme } = useMantineColorScheme();

  return (
    <Container>
      <Input.Wrapper label="UI Scale" mb="xl">
        <Slider
          defaultValue={val.scale * 100}
          min={70}
          max={130}
          step={5}
          marks={[
            {
              label: "70%",
              value: 70,
            },
            {
              value: 80,
            },
            {
              value: 90,
            },
            {
              label: "100%",
              value: 100,
            },
            {
              value: 110,
            },
            {
              value: 100,
            },
            {
              value: 120,
            },
            {
              label: "130%",
              value: 130,
            },
          ]}
          onChange={(value) => {
            setState({ ...state, scale: value / 100 });
          }}
        />
      </Input.Wrapper>
      <InputWrapper label="Color Scheme" mb="xl">
        <Button.Group>
          <Button
            variant={colorScheme == "light" ? "filled" : "default"}
            leftSection={<IconSun />}
            onClick={() => setColorScheme("light")}
          >
            Light
          </Button>
          <Button
            variant={colorScheme == "dark" ? "filled" : "default"}
            leftSection={<IconMoon />}
            onClick={() => setColorScheme("dark")}
          >
            Dark
          </Button>
        </Button.Group>
      </InputWrapper>
    </Container>
  );
}
