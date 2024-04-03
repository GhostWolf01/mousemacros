import { readTextFile, writeTextFile, BaseDirectory } from "@tauri-apps/api/fs";
import { message } from "@tauri-apps/api/dialog";
import { ref } from "vue";
import type {
  IClickConfig,
  IConfig,
  IConfigFile,
  IMainVariantConfig,
  ISubVariantConfig,
} from "./types/app";
import { ITransportConfig } from "./types/tray";
import { WebviewWindow } from "@tauri-apps/api/window";

function getDefaultSubVariants(): ISubVariantConfig[] {
  const variants: ISubVariantConfig[] = [];
  for (let index = 0; index <= 9; index++) {
    variants.push(getDefaultSubVariant(index));
  }
  return variants;
}

export function getDefaultSubVariant(id: number = 0): ISubVariantConfig {
  return {
    title: `variant${id}`,
    id,
    sensitivity: 1,
    times: 10,
    rate: 10,
  };
}

function getDefaultClick(): IClickConfig {
  return {
    times: 5,
    rate: 15,
  };
}

function getDefaultConfig(id: number = 0, title: string = "Main"): IMainVariantConfig {
  return {
    activeSubVariant: 0,
    title,
    id,
    main: getDefaultSubVariant(),
    click: getDefaultClick(),
    subVariants: getDefaultSubVariants(),
  };
}

export const config: IConfig = {
  activeScript: ref(false),
  activeMouseClick: ref(false),
  showTray: ref(true),
  mainConfig: {
    activeMainVariant: ref(0),
    activeSubVariant: ref(0),
    main: ref(getDefaultSubVariant()),
    click: ref(getDefaultClick()),
  },
  variantsConfig: [getDefaultConfig()],

  async parseConfig() {
    try {
      const file = await readTextFile("config.json", { dir: BaseDirectory.Resource }); //
      if (file) {
        const configFile = JSON.parse(file) as IConfigFile;
        const activeMainVariant =
          configFile.mainVariants.find((item) => item.id === configFile.activeMainVariant) ??
          getDefaultConfig();
        this.mainConfig.activeMainVariant.value = configFile.activeMainVariant;
        this.mainConfig.activeSubVariant.value = activeMainVariant.activeSubVariant;
        this.mainConfig.main.value = { ...activeMainVariant.main };
        this.mainConfig.click.value = { ...activeMainVariant.click };
        this.variantsConfig = configFile.mainVariants;
      }
    } catch (error) {
      console.error(error);
      message("Configuration is not open!", { title: "Tauri", type: "error" });
    }
  },

  async saveConfig() {
    try {
      const configFile: IConfigFile = {
        activeMainVariant: this.mainConfig.activeMainVariant.value,
        mainVariants: this.variantsConfig,
      };

      await writeTextFile("config.json", JSON.stringify(configFile), {
        dir: BaseDirectory.Resource,
      });
    } catch (error) {
      console.error(error);
      message("Configuration is not saved!", { title: "Tauri", type: "error" });
    }
  },

  autoSaveClick() {
    const mainVariant = this.variantsConfig.find(
      (item) => item.id === this.mainConfig.activeMainVariant.value
    );
    if (mainVariant) {
      mainVariant.click = { ...this.mainConfig.click.value };
    } else message("Auto Save Click is not saved!", { title: "Tauri", type: "error" });
  },

  autoSaveSubVariantConfig() {
    const mainVariant = this.variantsConfig.find(
      (item) => item.id === this.mainConfig.activeMainVariant.value
    );
    if (mainVariant) {
      const subVariant = mainVariant.subVariants.find(
        (item) => item.id === this.mainConfig.activeSubVariant.value
      );
      if (subVariant) {
        subVariant.rate = this.mainConfig.main.value.rate;
        subVariant.sensitivity = this.mainConfig.main.value.sensitivity;
        subVariant.times = this.mainConfig.main.value.times;
      } else
        message("Auto Save Sub VariantConfig is not saved!", { title: "Tauri", type: "error" });
    } else message("Auto Save Sub VariantConfig is not saved!", { title: "Tauri", type: "error" });
  },

  addMainVariantConfig(title) {
    this.variantsConfig.push(getDefaultConfig(this.variantsConfig.length, title));
  },

  activeMainVariantConfig(mainVariantId) {
    const mainVariant = this.variantsConfig.find((item) => item.id === mainVariantId);
    if (mainVariant) {
      this.mainConfig.activeMainVariant.value = mainVariant.id;
      this.mainConfig.activeSubVariant.value = mainVariant.activeSubVariant;
      this.mainConfig.main.value = { ...mainVariant.main };
      this.mainConfig.click.value = { ...mainVariant.click };
    } else message("Configuration is not change!", { title: "Tauri", type: "error" });
  },

  safeSubVariantConfig(subVariantId) {
    // this.mainConfig.activeSubVariant.value = variant;
    const mainVariant = this.variantsConfig.find(
      (item) => item.id === this.mainConfig.activeMainVariant.value
    );
    if (mainVariant) {
      const subVariant = mainVariant.subVariants.find((item) => item.id === subVariantId);
      if (subVariant) {
        subVariant.rate = this.mainConfig.main.value.rate;
        subVariant.sensitivity = this.mainConfig.main.value.sensitivity;
        subVariant.times = this.mainConfig.main.value.times;
      } else message("Configuration is not saved!", { title: "Tauri", type: "error" });
    } else message("Configuration is not saved!", { title: "Tauri", type: "error" });
    // console.log(`safeVariantConfig variant${variant}`);
  },

  activeSubVariantConfig(subVariantId) {
    const mainVariant = this.variantsConfig.find(
      (item) => item.id === this.mainConfig.activeMainVariant.value
    );

    if (mainVariant) {
      const subVariant = mainVariant.subVariants.find((item) => item.id === subVariantId);
      if (subVariant) {
        mainVariant.activeSubVariant = subVariant.id;
        mainVariant.main = { ...subVariant };
        this.mainConfig.activeSubVariant.value = subVariant.id;
        this.mainConfig.main.value = { ...subVariant };
      } else
        message(`Configuration sub variant ${subVariantId} is not active!`, {
          title: "Tauri",
          type: "error",
        });
      // console.log(`activeVariantConfig variant${variant}`);
    } else {
      message(`Configuration sub variant ${subVariantId} is not active!`, {
        title: "Tauri",
        type: "error",
      });
    }
  },
};

export function changeConfig(trayWebview: WebviewWindow) {
  const trayConfig: ITransportConfig = {
    activeScript: config.activeScript.value,
    showTray: config.showTray.value,
    config: {
      activeVariant: config.mainConfig.activeSubVariant.value,
      main: {
        ...config.mainConfig.main.value,
      },
    },
  };
  trayWebview.emit("changeConfig", trayConfig);
}
