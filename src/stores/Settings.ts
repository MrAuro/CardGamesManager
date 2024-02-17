import { atom } from "recoil";
import { Settings } from "../types/Settings";

const defaultSettings: Settings = {
  scale: 1,
  debug: false,
};

export const SETTINGS_STATE = atom<Settings>({
  key: "SETTINGS",
  default: defaultSettings,
});
