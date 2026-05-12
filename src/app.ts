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
      const file = await readTextFile("config.json", { dir: BaseDirectory.Resource });
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
      await saveLogs(`Failed to open configuration: ${error}`);
      message("Configuration is not open!", { title: "Tauri", type: "error" });
    }
  },

  async saveConfig(showMessage = true ) {
    try {
      const configFile: IConfigFile = {
        activeMainVariant: this.mainConfig.activeMainVariant.value,
        mainVariants: this.variantsConfig,
      };

      await writeTextFile("config.json", JSON.stringify(configFile), {
        dir: BaseDirectory.Resource,
      });
      if (showMessage) {
        message("Configuration saved successfully", { title: "Tauri", type: "info" });
      }
    } catch (error) {
      console.error(error);
      await saveLogs(`Failed to save config: ${error}`);
      message("Configuration is not saved!", { title: "Tauri", type: "error" });
    }
  },

  autoSaveClick() {
    const mainVariant = this.variantsConfig.find(
      (item) => item.id === this.mainConfig.activeMainVariant.value
    );
    if (mainVariant) {
      mainVariant.click = { ...this.mainConfig.click.value };
    } else {
      message("Auto Save Click is not saved!", { title: "Tauri", type: "error" });
      saveLogs(`Auto Save Click is not saved! mainVariant not found with id: ${this.mainConfig.activeMainVariant.value}`);
    }
  },

  autoSaveSubVariantConfig() {
    const mainVariant = this.variantsConfig.find(
      (item) => item.id === this.mainConfig.activeMainVariant.value
    );
    if (mainVariant) {
      mainVariant.main = { ...this.mainConfig.main.value };

      const subVariant = mainVariant.subVariants.find(
        (item) => item.id === this.mainConfig.activeSubVariant.value
      );
      if (subVariant) {
        subVariant.rate = this.mainConfig.main.value.rate;
        subVariant.sensitivity = this.mainConfig.main.value.sensitivity;
        subVariant.times = this.mainConfig.main.value.times;
      } else {
        message("Auto Save Sub VariantConfig is not saved!", { title: "Tauri", type: "error" });
        saveLogs(`Auto Save Sub VariantConfig is not saved! subVariant not found with id: ${this.mainConfig.activeSubVariant.value}`);
      }
    } else {
      message("Auto Save Sub VariantConfig is not saved!", { title: "Tauri", type: "error" });
      saveLogs(`Auto Save Sub VariantConfig is not saved! mainVariant not found with id: ${this.mainConfig.activeMainVariant.value}`);
    }
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
    } else {
      message("Configuration is not change!", { title: "Tauri", type: "error" });
      saveLogs(`Configuration is not change! mainVariant not found with id: ${mainVariantId}`);
    }
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
      } else {
        message("Configuration is not saved!", { title: "Tauri", type: "error" });
        saveLogs(`Configuration is not saved! subVariant not found with id: ${subVariantId}`);
      }
    } else {
      message("Configuration is not saved!", { title: "Tauri", type: "error" });
      saveLogs(`Configuration is not saved! mainVariant not found with id: ${this.mainConfig.activeMainVariant.value}`);
    }
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
      } else {
        message(`Configuration sub variant ${subVariantId} is not active!`, {
          title: "Tauri",
          type: "error",
        });
        saveLogs(`Configuration sub variant ${subVariantId} is not active! subVariant not found with id: ${subVariantId}`);
      }
      // console.log(`activeVariantConfig variant${variant}`);
    } else {
      message(`Configuration sub variant ${subVariantId} is not active!`, {
        title: "Tauri",
        type: "error",
      });
      saveLogs(`Configuration sub variant ${subVariantId} is not active! mainVariant not found with id: ${this.mainConfig.activeMainVariant.value}`);
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

export async function saveLogs(log: string) {
  const date = new Date();
  const logWithDate = `[${date.toLocaleString()}] ${log}\n`;

  await writeTextFile("logs.log", logWithDate, {
    dir: BaseDirectory.Resource,
    append: true,
  });
}
