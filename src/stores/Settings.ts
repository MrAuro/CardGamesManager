import { atom } from "recoil";
import { Settings } from "../types/Settings";

export const SETTINGS_STATE = atom<Settings>({
  key: "SETTINGS",
  default: {
    scale: 1,
    debug: false,
  },
});
