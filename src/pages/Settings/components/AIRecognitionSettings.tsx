import { SETTINGS_STATE } from "@/Root";
import {
  Button,
  ButtonGroup,
  Checkbox,
  Grid,
  Input,
  PasswordInput,
  Select,
  Slider,
  Text,
  Title,
} from "@mantine/core";
import { IconCamera, IconCameraOff, IconSparkles } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";

export default function AIRecognitionSettings() {
  const [settings, setSettings] = useRecoilState(SETTINGS_STATE);
  const [tempGeminiApiKey, setTempGeminiApiKey] = useState(settings.geminiApiKey);

  const [devices, setDevices] = useState([]);

  const handleDevices = useCallback(
    (mediaDevices: any) =>
      setDevices(mediaDevices.filter(({ kind }: any) => kind === "videoinput")),
    [setDevices]
  );

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  return (
    <>
      <Title order={2}>
        <IconSparkles /> AI Card Recognition
      </Title>
      <Text size="sm" c="dimmed">
        Use Google's Gemini AI to detect playing cards through your webcam. Additional terms and
        conditions apply.
      </Text>
      <Text size="sm" c="dimmed">
        You can get your Generative Language Client API key from aistudio.google.com. The free tier
        is sufficient for this application.
      </Text>
      <Input.Wrapper
        label="Enable Camera Menu"
        description="Show the menu to preview and capture images from the camera. The menu will be on the opposite side of the touchscreen menu."
        mt="sm"
        mb="sm"
      >
        <ButtonGroup mt={5}>
          <Button
            variant={settings.cameraMenu ? "filled" : "default"}
            leftSection={<IconCamera />}
            onClick={() => {
              setSettings({ ...settings, cameraMenu: true });
            }}
          >
            On
          </Button>
          <Button
            variant={!settings.cameraMenu ? "filled" : "default"}
            leftSection={<IconCameraOff />}
            onClick={() => {
              setSettings({ ...settings, cameraMenu: false });
            }}
          >
            Off
          </Button>
        </ButtonGroup>
      </Input.Wrapper>
      <Input.Wrapper
        mb="xl"
        label="Camera Menu Width"
        description="Certain UI elements may look weird at low and high percents"
        mt="sm"
      >
        <Slider
          mt="xs"
          defaultValue={settings.cameraMenuWidth}
          min={15}
          max={85}
          step={5}
          marks={[
            {
              label: "15%",
              value: 15,
            },
            {
              label: "30%",
              value: 30,
            },
            {
              label: "45%",
              value: 45,
            },
            {
              label: "60%",
              value: 60,
            },
            {
              label: "75%",
              value: 75,
            },
            {
              label: "85%",
              value: 85,
            },
          ]}
          onChangeEnd={(value) => {
            setSettings({ ...settings, cameraMenuWidth: value });
          }}
        />
      </Input.Wrapper>
      <Input.Wrapper label="Gemini API Key">
        <Grid>
          <Grid.Col span={{ base: 8 }}>
            <PasswordInput
              value={tempGeminiApiKey}
              placeholder="Enter your Gemini API Key"
              onChange={(event) => setTempGeminiApiKey(event.currentTarget.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 4 }}>
            <Button
              fullWidth
              disabled={tempGeminiApiKey === settings.geminiApiKey}
              onClick={() => {
                setSettings({ ...settings, geminiApiKey: tempGeminiApiKey });
              }}
            >
              Save
            </Button>
          </Grid.Col>
        </Grid>
      </Input.Wrapper>
      <Input.Wrapper mt="sm" label="Camera Source">
        <Select
          data={devices.map((device: any) => ({
            value: device.deviceId,
            label: device.label || `Camera ${device.deviceId}`,
          }))}
          defaultValue={settings.cameraDeviceId}
          allowDeselect={false}
          placeholder={
            settings.cameraDeviceId !== ""
              ? (
                  devices.find((device: any) => device.deviceId === settings.cameraDeviceId) || {
                    label: "Select Camera",
                  }
                ).label
              : "Select Camera"
          }
          onChange={(value) => {
            setSettings({ ...settings, cameraDeviceId: value as string });
          }}
        />
      </Input.Wrapper>
      <Checkbox
        mt="sm"
        radius="sm"
        size="md"
        label="Mirrored"
        checked={settings.cameraFlipHorizontal}
        onChange={(event) => {
          setSettings({ ...settings, cameraFlipHorizontal: event.currentTarget.checked });
        }}
      />
    </>
  );
}
