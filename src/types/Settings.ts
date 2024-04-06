import { Page } from "./State";

export type Settings = {
  scale: number;
  debug: boolean;
  activeTab: Page;
  cornerOfEyeMode: boolean;
  chipsMode: boolean;
  fourColorDeck: boolean;
  touchscreenMenu: boolean;
  touchscreenMenuPosition: "left" | "right";
  touchscreenMenuWidth: number;
};

export type Chip = {
  color: string;
  denomination: number;
};
