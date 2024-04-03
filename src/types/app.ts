import type { Ref } from "vue";

export interface IMainVariantConfig {
  activeSubVariant: number;
  title: string;
  id: number;
  main: ISubVariantConfig;
  click: IClickConfig;
  subVariants: ISubVariantConfig[];
}

export interface IMainConfig {
  activeMainVariant: Ref<number>;
  activeSubVariant: Ref<number>;
  main: Ref<ISubVariantConfig>;
  click: Ref<IClickConfig>;
  // [key: string]: Ref<IVariantConfig> | Ref<IClickConfig> | IVariantConfig | Ref<number>;
}

export interface IConfig {
  activeScript: Ref<boolean>;
  activeMouseClick: Ref<boolean>;
  showTray: Ref<boolean>;
  mainConfig: IMainConfig;
  variantsConfig: IMainVariantConfig[];
  parseConfig: () => Promise<void>;
  saveConfig: () => Promise<void>;
  addMainVariantConfig: (title: string) => void;
  activeMainVariantConfig: (mainVariantId: number) => void;
  safeSubVariantConfig: (subVariantId: number) => void;
  activeSubVariantConfig: (subVariantId: number) => void;
  autoSaveClick: () => void;
  autoSaveSubVariantConfig: () => void;
}

export interface ISubVariantConfig {
  title: string; // variant[0 - 9]
  id: number; // variant[0 - 9]
  sensitivity: number;
  times: number;
  rate: number;
}

export interface IClickConfig {
  times: number;
  rate: number;
}

export interface IMainVariantConfigFile {
  activeSubVariant: number;
  title: string;
  id: number;
  main: ISubVariantConfig;
  click: IClickConfig;
  subVariants: ISubVariantConfig[];
}

export interface IConfigFile {
  activeMainVariant: number;
  mainVariants: IMainVariantConfigFile[];
  // [key: string]: IClickConfig | IVariantConfig | number;
}

export interface IInputTypes {
  sensitivity: () => void;
  times: () => void;
  rate: () => void;
  activeScript: () => void;
  activeMouseClick: () => void;
  showTray: () => void;
  clickTimes: () => void;
  clickRate: () => void;
}

export type InputType =
  | "sensitivity"
  | "times"
  | "rate"
  | "activeScript"
  | "activeMouseClick"
  | "showTray"
  | "clickTimes"
  | "clickRate";

export interface IPayload {
  pressed: number;
}
