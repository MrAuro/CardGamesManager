import { Container, Input, Slider, useMantineTheme } from "@mantine/core";
import { useRecoilState, useRecoilValue } from "recoil";
import { STATE, State, STATE_WATCHER } from "../App";

export default function Settings() {
  const [state, setState] = useRecoilState(STATE);
  const val = useRecoilValue<State>(STATE_WATCHER);
  const theme = useMantineTheme();

  return (
    <Container>
      <Input.Wrapper label="UI Scale">
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
    </Container>
  );
}
