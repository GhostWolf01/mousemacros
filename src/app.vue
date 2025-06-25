<script setup lang="ts">
import { ref, watch } from "vue";
import { UnlistenFn } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/window";
import { config, changeConfig } from "./app";
import { bindKey, mouseMove, mouseClick, bindHoldKey, activeBindKeys } from "./bindKeys";
import Input from "./components/Input.vue";
import Select, { ISelectItem } from "./components/Select.vue";
import Button from "./components/Button.vue";
import AddVariantModal from "./components/AddVariantModal.vue";
import { trayWebviewConfig } from "./tray/tray";
import type { IInputTypes, IPayload, InputType } from "./types/app";
import { appWindow } from "@tauri-apps/api/window";

const trayWebview = new WebviewWindow("trayWebview", trayWebviewConfig);

appWindow.onCloseRequested(async () => {
  try {
    await config.saveConfig();
  } catch (error) {}

  await trayWebview.close();
});

trayWebview.once("tauri://created", async function () {
  await trayWebview.setIgnoreCursorEvents(true);
  await trayWebview.setCursorGrab(false);
});
trayWebview.once("tauri://error", function (e) {
  console.log(e);
});

async function main() {
  if (import.meta.env.PROD) {
    window.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });
  }

  await config.parseConfig();

  const mainVariant = config.variantsConfig.find(
    (item) => item.id === config.mainConfig.activeMainVariant.value
  );
  if (mainVariant) {
    selectConfigVariant.value.id = mainVariant.id;
    selectConfigVariant.value.title = mainVariant.title;
  }

  const unlistens: UnlistenFn[] = [];

  unlistens.push(
    await bindHoldKey<IPayload>("LeftButton", () => {
      mouseMove();
      mouseClick();
    })
  );

  unlistens.push(
    await bindKey("Backquote", () => {
      config.activeScript.value = !config.activeScript.value;
    })
  );

  unlistens.push(
    await bindKey("F1", () => {
      config.activeMouseClick.value = !config.activeMouseClick.value;
    })
  );

  unlistens.push(
    await bindKey("Add", () => {
      if (config.mainConfig.main.value.sensitivity + 1 <= 500) {
        config.mainConfig.main.value.sensitivity++;
        config.autoSaveSubVariantConfig();
      }
    })
  );

  unlistens.push(
    await bindKey("Subtract", () => {
      if (config.mainConfig.main.value.sensitivity - 1 > 0) {
        config.mainConfig.main.value.sensitivity--;
        config.autoSaveSubVariantConfig();
      }
    })
  );

  unlistens.push(
    await bindKey("Control_Alt_S", async () => {
      await config.saveConfig();
    })
  );

  for (let index = 0; index <= 9; index++) {
    unlistens.push(
      await bindKey(`Control_Alt_Numpad${index}`, () => {
        config.safeSubVariantConfig(index);
      })
    );

    unlistens.push(
      await bindKey(`Alt_Numpad${index}`, () => {
        config.activeSubVariantConfig(index);
      })
    );
  }

  await activeBindKeys();
}

function changeInput(value: string | number | boolean, type: InputType) {
  const InputTypes: IInputTypes = {
    sensitivity: () => {
      config.mainConfig.main.value.sensitivity = Number(value);
      config.autoSaveSubVariantConfig();
    },
    times: () => {
      config.mainConfig.main.value.times = Number(value);
      config.autoSaveSubVariantConfig();
    },
    rate: () => {
      config.mainConfig.main.value.rate = Number(value);
      config.autoSaveSubVariantConfig();
    },
    activeScript: () => {
      config.activeScript.value = Boolean(value);
    },
    activeMouseClick: () => {
      config.activeMouseClick.value = Boolean(value);
    },
    showTray: () => {
      config.showTray.value = Boolean(value);
    },
    clickTimes: () => {
      config.mainConfig.click.value.times = Number(value);
      config.autoSaveClick();
    },
    clickRate: () => {
      config.mainConfig.click.value.rate = Number(value);
      config.autoSaveClick();
    },
  };
  InputTypes[type]?.();
}

watch(config.showTray, async () => {
  if (config.showTray.value) await trayWebview.unminimize();
  else await trayWebview.minimize();
  // await trayWebview.minimize()
});

watch(
  () => config.mainConfig.main.value.sensitivity,
  () => changeConfig(trayWebview)
);

watch(config.activeScript, () => changeConfig(trayWebview));

const selectConfigVariant = ref<ISelectItem>({ id: null, title: "" });

function changeSelect(value: ISelectItem) {
  selectConfigVariant.value = { ...value };
  if (value.id !== null) {
    config.activeMainVariantConfig(value.id);
  }
}

const showAddModal = ref(false);

function openAddModal() {
  showAddModal.value = true;
}

function hiddenAddModal() {
  showAddModal.value = false;
}

await main();
</script>

<template>
  <main class="app">
    <section class="section">
      <span class="section-label"> Main Config Variant </span>
      <div class="section-inline">
        <Select
          label=""
          name="mainConfigVariant"
          :value="selectConfigVariant"
          :items="config.variantsConfig"
          @change="changeSelect"
        ></Select>
        <Button type="button" text="Add" @click="openAddModal" />
      </div>
    </section>
    <section class="section">
      <span class="section-label"> Mouse Move </span>
      <h3 class="section-title">
        Active Sub Variant Config {{ config.mainConfig.activeSubVariant }}
      </h3>
      <Input
        label="Sensitivity:"
        type="number"
        name="sensitivity"
        :min="1"
        :max="500"
        :value="config.mainConfig.main.value.sensitivity"
        @change="(value) => changeInput(value, 'sensitivity')"
      />
      <Input
        label="Times:"
        type="number"
        name="times"
        :min="1"
        :max="500"
        :value="config.mainConfig.main.value.times"
        @change="(value) => changeInput(value, 'times')"
      />
      <Input
        label="Rate:"
        type="number"
        name="rate"
        :min="1"
        :max="500"
        :value="config.mainConfig.main.value.rate"
        @change="(value) => changeInput(value, 'rate')"
      />
      <Input
        label="Active Script"
        right
        type="checkbox"
        name="activeScript"
        :value="config.activeScript.value"
        @change="(value) => changeInput(value, 'activeScript')"
      />
      <Input
        label="Show Tray"
        right
        type="checkbox"
        name="showTray"
        :value="config.showTray.value"
        @change="(value) => changeInput(value, 'showTray')"
      />
    </section>
    <section class="section">
      <span class="section-label"> Mouse Click </span>
      <Input
        label="Click Times:"
        type="number"
        name="clickTimes"
        :min="1"
        :max="500"
        :value="config.mainConfig.click.value.times"
        @change="(value) => changeInput(value, 'clickTimes')"
      />
      <Input
        label="Click Rate:"
        type="number"
        name="clickRate"
        :min="1"
        :max="500"
        :value="config.mainConfig.click.value.rate"
        @change="(value) => changeInput(value, 'clickRate')"
      />
      <Input
        label="Active Mouse Click"
        right
        type="checkbox"
        name="activeMouseClick"
        :value="config.activeMouseClick.value"
        @change="(value) => changeInput(value, 'activeMouseClick')"
      />
    </section>
  </main>
  <AddVariantModal :show="showAddModal" @cancel="hiddenAddModal" />
</template>

<style lang="scss">
.app {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px;
}

.section {
  position: relative;
  padding: 16px 12px 14px 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid grey;
  border-radius: 10px;
  width: 100%;
  margin: 5px 0;
  &:last-of-type {
    margin-bottom: 0;
  }
  & > :nth-child(n) {
    margin-bottom: 4px;
  }
  & > .section-label {
    margin-bottom: 0;
  }
  & > :last-child {
    margin-bottom: 0;
  }
  &-label {
    font-size: 18px;
    position: absolute;
    top: -10px;
    left: 10px;
    background-color: #2f2f2f;
    padding: 0 5px;
    border-radius: 10px;
  }
  &-title {
    padding: 8px 0 4px;
    margin: 0;
    font-size: 18px;
  }
  &-inline {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    width: 100%;
    & > :last-child {
      margin-left: 5px;
    }
  }
}
</style>
