import { UUID } from "crypto";
import { Page } from "./State";

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

export type Chip = {
  id: UUID;
  color: string;
  denomination: number;
};
