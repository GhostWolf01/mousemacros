import type { Ref } from "vue";
import { ISubVariantConfig } from "./app";

export interface IConfig {
  activeScript: Ref<boolean>;
  showTray: Ref<boolean>;
  config: IVariantsConfig;
}

export interface ITransportConfig {
  activeScript: boolean;
  showTray: boolean;
  config: ITransportVariantsConfig;
}

export interface ITransportVariantsConfig {
  activeVariant: number;
  main: ISubVariantConfig;
}

export interface IVariantsConfig {
  activeVariant: Ref<number>;
  main: Ref<ISubVariantConfig>;
}

type TimerType = number | undefined;

export interface ITimers {
  activeScript: TimerType;
  activeVariant: TimerType;
  sensitivity: TimerType;
  actions: {
    activeScript: () => void;
    activeVariant: () => void;
    sensitivity: () => void;
  };
}
