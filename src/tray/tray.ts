import { WindowOptions } from "@tauri-apps/api/window";
import { ref } from "vue";
import { IConfig } from "../types/tray";
import { getDefaultSubVariant } from "../app";

export const trayWebviewConfig: WindowOptions = {
  title: "Tray MouseMacros",
  url: "./tray.html",
  height: 0,
  width: 0,
  x: 0,
  y: 0,
  transparent: true,
  titleBarStyle: "transparent",
  alwaysOnTop: true,
  hiddenTitle: true,
  resizable: false,
  fullscreen: false,
  decorations: false,
  focus: false,
  fileDropEnabled: false,
};

export const config: IConfig = {
  activeScript: ref(false),
  showTray: ref(true),
  config: {
    activeVariant: ref(0),
    main: ref(getDefaultSubVariant()),
  },
};
