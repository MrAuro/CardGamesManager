import {
  Button,
  Container,
  Input,
  InputWrapper,
  Slider,
  useMantineColorScheme,
  // useMantineTheme,
} from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useRecoilState } from "recoil";
import { STATE } from "../App";

export default function Settings() {
  const [state, setState] = useRecoilState(STATE);
  // const theme = useMantineTheme();
  const { setColorScheme, colorScheme } = useMantineColorScheme();

  return (
    <Container>
      <Input.Wrapper label="UI Scale" mb="xl">
        <Slider
          defaultValue={state.scale * 100}
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
      <InputWrapper label="Color Scheme" mb="md">
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
      <Button
        color="red"
        onClick={() => {
          localStorage.clear();
          window.location.reload();
        }}
      >
        Reset Game
      </Button>
    </Container>
  );
}
