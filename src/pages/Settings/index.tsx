import GeneralSettings from "./components/GeneralSettings";
import PokerSettings from "./components/PokerSettings";
import BlackjackSettings from "./components/BlackjackSettings";
import { Divider } from "@mantine/core";

export default function Settings() {
  return (
    <>
      <GeneralSettings />
      <Divider my="sm" />
      <BlackjackSettings />
      <Divider my="sm" />
      <PokerSettings />
    </>
  );
}
