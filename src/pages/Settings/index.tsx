import General from "./components/General";
import Poker from "./components/Poker";
import Blackjack from "./components/Blackjack";

export default function Settings() {
  return (
    <>
      <h1>Settings</h1>
      <General />
      <Blackjack />
      <Poker />
    </>
  );
}
