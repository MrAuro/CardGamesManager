import GeneralSettings from "./components/GeneralSettings";
import PokerSettings from "./components/PokerSettings";
import BlackjackSettings from "./components/BlackjackSettings";
import { Divider } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { Text } from "@mantine/core";
import AIRecognitionSettings from "./components/AIRecognitionSettings";
import { getTauriVersion, getVersion } from "@tauri-apps/api/app";
import OtherSettings from "./components/OtherSettings";
const tauriVersion = await getTauriVersion();
const appVersion = await getVersion();

export default function Settings() {
  const [firstTime, setFirstTime] = useLocalStorage({
    key: "first-time",
    defaultValue: true,
  });

  return (
    <>
      <GeneralSettings />
      <Divider my="sm" />
      <BlackjackSettings />
      <Divider my="sm" />
      <PokerSettings />
      <Divider my="sm" />
      <AIRecognitionSettings />
      <Divider my="sm" />
      <OtherSettings />
      <Text size="sm" c="dimmed">
        v{appVersion} (Tauri v{tauriVersion})
      </Text>
      {!firstTime && (
        <Text
          mb="md"
          style={{
            cursor: "pointer",
          }}
          onClick={() => setFirstTime(true)}
        >
          You have agreed to the License and Disclaimer. Click to view again (this will NOT void
          your agreement, it's just for your reference).
        </Text>
      )}
    </>
  );
}
