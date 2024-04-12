import GeneralSettings from "./components/GeneralSettings";
import PokerSettings from "./components/PokerSettings";
import BlackjackSettings from "./components/BlackjackSettings";
import { Divider } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { Text } from "@mantine/core";

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
      {!firstTime && (
        <Text
          mb="md"
          style={{
            cursor: "pointer",
          }}
          onClick={() => setFirstTime(true)}
        >
          You have agreed to the Terms of Service. Click to view again (this will NOT void your
          agreement, it's just for your reference).
        </Text>
      )}
    </>
  );
}
