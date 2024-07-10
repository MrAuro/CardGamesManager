import { SETTINGS_STATE } from "@/Root";
import {
  ActionIcon,
  Button,
  ButtonGroup,
  Checkbox,
  Flex,
  Grid,
  Input,
  InputWrapper,
  PasswordInput,
  Select,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import {
  IconHandFinger,
  IconHandFingerOff,
  IconRotate2,
  IconRotateClockwise2,
  IconSparkles,
} from "@tabler/icons-react";
import { useState, useCallback, useEffect } from "react";
import { useRecoilState } from "recoil";

export default function AIRecognitionSettings() {
  const [settings, setSettings] = useRecoilState(SETTINGS_STATE);
  const [tempGeminiApiKey, setTempGeminiApiKey] = useState(settings.geminiApiKey);
  const theme = useMantineTheme();

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
