import { PLAYERS_STATE, SETTINGS_STATE } from "@/Root";
import { Player } from "@/types/Player";
import { Button, Input, Slider, Title } from "@mantine/core";
import { useRecoilState } from "recoil";

export default function GeneralSettings() {
  const [settings, setSettings] = useRecoilState(SETTINGS_STATE);
  const [players, setPlayers] = useRecoilState(PLAYERS_STATE);

  return (
    <>
      <Title order={2}>General Settings</Title>
      <Button
        onClick={() => {
          const players: Player[] = [
            "Michael",
            "Jim",
            "Pam",
            "Dwight",
            "Angela",
            "Kevin",
            "Oscar",
            "Toby",
            "Creed",
            "Stanley",
          ].map((name) => {
            return {
              name,
              balance: Math.floor(Math.random() * 41) + 10,
              id: crypto.randomUUID(),
            };
          });

          setPlayers(players);
        }}
      >
        Populate players
      </Button>
      <Input.Wrapper mb="xl" label="UI Scale">
        <Slider
          defaultValue={settings.scale}
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
            setSettings({ ...settings, scale: value });
          }}
        />
      </Input.Wrapper>
    </>
  );
}
