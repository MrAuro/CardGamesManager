import { UUID } from "crypto";
import { Page } from "./State";

export const DEFAULT_SETTINGS: Settings = {
  scale: 100,
  debug: false,
  activeTab: "Players",
  cornerOfEyeMode: false,
  chipsMode: false,
  fourColorDeck: false,
  touchscreenMenu: false,
  swapSideMenus: false,
  touchscreenMenuWidth: 30,
  touchscreenMenuChipsColumns: 3,
  touchscreenMenuCalculator: true,
  tts: false,
  ttsVoice: "Microsoft David Desktop - English (United States)",
  ttsRate: 1,
  ttsPitch: 1,
  ttsVolume: 1,
  geminiApiKey: "",
  cameraDeviceId: "",
  cameraFlipHorizontal: false,
  cameraMenu: false,
  cameraMenuWidth: 15,
};

export type Settings = {
  scale: number;
  debug: boolean;
  activeTab: Page;
  cornerOfEyeMode: boolean;
  chipsMode: boolean;
  fourColorDeck: boolean;
  touchscreenMenu: boolean;
  swapSideMenus: boolean;
  touchscreenMenuWidth: number;
  touchscreenMenuChipsColumns: number;
  touchscreenMenuCalculator: boolean;
  tts: boolean;
  ttsVoice: string;
  ttsRate: number;
  ttsPitch: number;
  ttsVolume: number;
  geminiApiKey: string;
  cameraDeviceId: string;
  cameraFlipHorizontal: boolean;
  cameraMenu: boolean;
  cameraMenuWidth: number;
};

export const DEFAULT_CHIP: Chip = {
  id: crypto.randomUUID(),
  color: "#ffffff",
  denomination: 0,
};

export type Chip = {
  id: UUID;
  color: string;
  denomination: number;
};
