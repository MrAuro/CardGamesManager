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
  touchscreenMenuPosition: "left" | "right";
  touchscreenMenuWidth: number;
};

export type Chip = {
  id: UUID;
  color: string;
  denomination: number;
};
