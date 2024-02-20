import GeneralSettings from "./components/GeneralSettings";
import PokerSettings from "./components/PokerSettings";
import BlackjackSettings from "./components/BlackjackSettings";

export default function Settings() {
  return (
    <>
      <GeneralSettings />
      <BlackjackSettings />
      <PokerSettings />
    </>
  );
}
